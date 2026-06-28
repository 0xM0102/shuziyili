package com.shuziyili.module.news;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shuziyili.config.JuheNewsProperties;
import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * 聚合数据「新闻头条」（文档 ID 235）：列表 {@code toutiao/index} 按 type 分槽缓存；详情调用 {@code
 * toutiao/content} 拉正文 HTML。
 *
 * <p>启用条件：{@code shuziyili.news.provider=juhe}（默认）且 {@code shuziyili.juhe.news.enabled=true} 并配置
 * {@code key}。
 */
@Service
public class JuheNewsProvider implements NewsProvider {

  private static final Logger log = LoggerFactory.getLogger(JuheNewsProvider.class);

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;
  private final JuheNewsProperties properties;

  private final Object lock = new Object();

  private static final class TypeSlot {
    List<NewsItemDto> items = List.of();
    Instant lastRemoteAttempt;
    Instant lastSuccessAt;
  }

  private static final class DetailSlot {
    NewsDetailResult result;
    Instant cachedAt;
  }

  private final Map<String, TypeSlot> slots = new LinkedHashMap<>();
  private Map<String, NewsItemDto> byUniquekey = Map.of();
  private final Map<String, DetailSlot> detailByKey = new LinkedHashMap<>();

  public JuheNewsProvider(
      RestTemplate restTemplate, ObjectMapper objectMapper, JuheNewsProperties properties) {
    this.restTemplate = restTemplate;
    this.objectMapper = objectMapper;
    this.properties = properties;
  }

  @Override
  public NewsProviderId id() {
    return NewsProviderId.JUHE;
  }

  @Override
  public String attribution() {
    return NewsAttributions.JUHE;
  }

  @Override
  public NewsHeadlinesPayload headlines(String typeParam) {
    String channel = NewsChannelTypes.normalize(typeParam);
    if (!upstreamConfigured()) {
      return NewsHeadlinesPayload.unconfigured(channel, properties.getRefreshSeconds());
    }
    synchronized (lock) {
      refreshIfStale(channel);
      TypeSlot slot = slots.get(channel);
      List<NewsItemDto> items = slot == null ? List.of() : slot.items;
      Instant lastSuccess = slot == null ? null : slot.lastSuccessAt;
      return NewsHeadlinesPayload.cached(
          items, lastSuccess, properties.getRefreshSeconds(), channel);
    }
  }

  @Override
  public Optional<NewsDetailResult> headlineDetail(String uniquekey) {
    if (uniquekey == null || uniquekey.isBlank()) {
      return Optional.empty();
    }
    String key = uniquekey.trim();
    if (!upstreamConfigured()) {
      return Optional.empty();
    }
    synchronized (lock) {
      DetailSlot slot = detailByKey.get(key);
      if (slot != null && !detailCacheExpired(slot.cachedAt)) {
        return Optional.of(slot.result);
      }

      refreshIfStale(NewsChannelTypes.normalize(properties.getType()));
      NewsItemDto fromList = byUniquekey.get(key);

      try {
        ContentFetch fetched = fetchRemoteContent(key);
        if (!fetched.ok) {
          return cacheListFallbackOrEmpty(key, fromList);
        }
        NewsItemDto merged = mergePreferList(fromList, fetched.item);
        return cacheAndReturn(key, new NewsDetailResult(merged, fetched.html));
      } catch (Exception e) {
        log.warn("juhe news content fetch failed uniquekey={}: {}", key, e.getMessage());
        return cacheListFallbackOrEmpty(key, fromList);
      }
    }
  }

  private boolean upstreamConfigured() {
    return properties.isEnabled() && NewsJsonSupport.notBlank(properties.getKey());
  }

  private Optional<NewsDetailResult> cacheListFallbackOrEmpty(String key, NewsItemDto fromList) {
    if (fromList == null) {
      return Optional.empty();
    }
    return cacheAndReturn(key, new NewsDetailResult(fromList, ""));
  }

  private Optional<NewsDetailResult> cacheAndReturn(String key, NewsDetailResult result) {
    putDetailCache(key, result);
    return Optional.of(result);
  }

  private void putDetailCache(String key, NewsDetailResult r) {
    DetailSlot s = new DetailSlot();
    s.result = r;
    s.cachedAt = Instant.now();
    detailByKey.put(key, s);
    if (detailByKey.size() > 400) {
      detailByKey.clear();
    }
  }

  private boolean detailCacheExpired(Instant cachedAt) {
    return NewsJsonSupport.refreshCooldownElapsed(
        cachedAt, Instant.now(), properties.getRefreshSeconds());
  }

  private void refreshIfStale(String channel) {
    if (!upstreamConfigured()) {
      return;
    }
    Instant now = Instant.now();
    TypeSlot slot = slots.computeIfAbsent(channel, k -> new TypeSlot());
    if (!NewsJsonSupport.refreshCooldownElapsed(
        slot.lastRemoteAttempt, now, properties.getRefreshSeconds())) {
      return;
    }
    slot.lastRemoteAttempt = now;
    try {
      List<NewsItemDto> parsed = fetchRemoteList(channel);
      slot.items = Collections.unmodifiableList(parsed);
      slot.lastSuccessAt = Instant.now();
    } catch (Exception e) {
      log.warn("juhe news fetch failed type={}: {}", channel, e.getMessage());
    }
    rebuildByUniquekeyIndex();
  }

  private List<NewsItemDto> fetchRemoteList(String channel) throws Exception {
    String body = restTemplate.getForObject(juheListUri(channel), String.class);
    return parseListBody(body);
  }

  private ContentFetch fetchRemoteContent(String uniquekey) throws Exception {
    String body = restTemplate.getForObject(juheContentUri(uniquekey), String.class);
    return parseContentBody(body, uniquekey);
  }

  private URI juheListUri(String channel) {
    return UriComponentsBuilder.fromHttpUrl(properties.getListUrl())
        .queryParam("key", properties.getKey())
        .queryParam("type", channel)
        .queryParam("page", "1")
        .queryParam("page_size", String.valueOf(properties.getPageSize()))
        .build(true)
        .toUri();
  }

  private URI juheContentUri(String uniquekey) {
    return UriComponentsBuilder.fromHttpUrl(properties.getContentUrl())
        .queryParam("key", properties.getKey())
        .queryParam("uniquekey", uniquekey)
        .build(true)
        .toUri();
  }

  private void rebuildByUniquekeyIndex() {
    List<Iterable<NewsItemDto>> itemLists = new ArrayList<>();
    for (TypeSlot slot : slots.values()) {
      itemLists.add(slot.items);
    }
    byUniquekey = NewsJsonSupport.indexItemsFirstWins(itemLists);
  }

  private List<NewsItemDto> parseListBody(String body) throws Exception {
    if (body == null || body.isBlank()) {
      return List.of();
    }
    JsonNode root = objectMapper.readTree(body);
    int err = juheErrorCode(root);
    if (err != 0) {
      log.warn("juhe news list error_code={} reason={}", err, root.path("reason").asText(""));
      return List.of();
    }
    JsonNode data = root.path("result").path("data");
    if (!data.isArray()) {
      return List.of();
    }
    List<NewsItemDto> out = new ArrayList<>();
    for (JsonNode n : data) {
      NewsItemDto it = mapJsonToItem(n);
      if (it != null) {
        out.add(it);
      }
    }
    return out;
  }

  private ContentFetch parseContentBody(String body, String requestUniquekey) throws Exception {
    if (body == null || body.isBlank()) {
      return ContentFetch.fail();
    }
    JsonNode root = objectMapper.readTree(body);
    int err = juheErrorCode(root);
    if (err != 0) {
      log.warn("juhe news content error_code={} reason={}", err, root.path("reason").asText(""));
      return ContentFetch.fail();
    }
    JsonNode result = root.path("result");
    if (!result.isObject()) {
      return ContentFetch.fail();
    }
    String html =
        NewsJsonSupport.firstNonBlank(
            NewsJsonSupport.text(result, "content"),
            NewsJsonSupport.text(result, "html"),
            NewsJsonSupport.text(result, "news_content"),
            NewsJsonSupport.text(result, "text"));
    NewsItemDto item = mapJsonToItem(result);
    if (item == null) {
      item = mapContentResultFallback(result, requestUniquekey);
    }
    if (item == null) {
      return ContentFetch.fail();
    }
    return new ContentFetch(true, item, html);
  }

  private NewsItemDto mapContentResultFallback(JsonNode result, String requestUniquekey) {
    String uk =
        NewsJsonSupport.firstNonBlank(
            NewsJsonSupport.text(result, "uniquekey"), requestUniquekey);
    if (uk.isEmpty()) {
      return null;
    }
    String title =
        NewsJsonSupport.firstNonBlank(
            NewsJsonSupport.text(result, "title"),
            NewsJsonSupport.text(result, "title_detail"),
            NewsJsonSupport.text(result, "topic"));
    if (title.isEmpty()) {
      title = "资讯详情";
    }
    return new NewsItemDto(
        uk,
        title,
        NewsJsonSupport.text(result, "date"),
        NewsJsonSupport.text(result, "category"),
        NewsJsonSupport.text(result, "author_name"),
        NewsJsonSupport.text(result, "url"),
        thumbnailFromNode(result));
  }

  private static NewsItemDto mergePreferList(NewsItemDto list, NewsItemDto api) {
    if (list == null) {
      return api;
    }
    return new NewsItemDto(
        list.getUniquekey(),
        pick(api.getTitle(), list.getTitle()),
        pick(api.getDate(), list.getDate()),
        pick(api.getCategory(), list.getCategory()),
        pick(api.getAuthorName(), list.getAuthorName()),
        pick(api.getUrl(), list.getUrl()),
        pick(api.getThumbnailUrl(), list.getThumbnailUrl()));
  }

  private static String pick(String a, String b) {
    return NewsJsonSupport.notBlank(a) ? a : (b == null ? "" : b);
  }

  private NewsItemDto mapJsonToItem(JsonNode n) {
    String uniquekey = NewsJsonSupport.text(n, "uniquekey");
    String title = NewsJsonSupport.text(n, "title");
    if (uniquekey.isEmpty() || title.isEmpty()) {
      return null;
    }
    return new NewsItemDto(
        uniquekey,
        title,
        NewsJsonSupport.text(n, "date"),
        NewsJsonSupport.text(n, "category"),
        NewsJsonSupport.text(n, "author_name"),
        NewsJsonSupport.text(n, "url"),
        thumbnailFromNode(n));
  }

  private static String thumbnailFromNode(JsonNode n) {
    return NewsJsonSupport.firstNonBlank(
        NewsJsonSupport.text(n, "thumbnail_pic_s"),
        NewsJsonSupport.text(n, "thumbnail_pic_s02"),
        NewsJsonSupport.text(n, "thumbnail_pic_s03"));
  }

  private static int juheErrorCode(JsonNode root) {
    return root.path("error_code").asInt(-1);
  }

  private static final class ContentFetch {
    final boolean ok;
    final NewsItemDto item;
    final String html;

    ContentFetch(boolean ok, NewsItemDto item, String html) {
      this.ok = ok;
      this.item = item;
      this.html = html != null ? html : "";
    }

    static ContentFetch fail() {
      return new ContentFetch(false, null, "");
    }
  }
}
