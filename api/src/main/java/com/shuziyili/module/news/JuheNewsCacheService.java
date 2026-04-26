package com.shuziyili.module.news;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shuziyili.config.JuheNewsProperties;
import java.time.Duration;
import java.time.Instant;
import java.net.URI;
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
 * 聚合「新闻头条」（文档 ID 235）：列表 {@code toutiao/index} 按 type 分槽缓存；详情在列表元数据基础上调用 {@code
 * toutiao/content} 拉正文 HTML，并按 {@link JuheNewsProperties#getRefreshSeconds()} 对<strong>每条
 * uniquekey</strong> 做详情结果缓存。列表与详情均会计入上游配额。
 */
@Service
public class JuheNewsCacheService {

  private static final Logger log = LoggerFactory.getLogger(JuheNewsCacheService.class);

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

  public JuheNewsCacheService(
      RestTemplate restTemplate, ObjectMapper objectMapper, JuheNewsProperties properties) {
    this.restTemplate = restTemplate;
    this.objectMapper = objectMapper;
    this.properties = properties;
  }

  public NewsHeadlinesPayload headlines(String typeParam) {
    String juheType = JuheNewsTypes.normalize(typeParam);
    if (!juheConfigured()) {
      return new NewsHeadlinesPayload(
          List.of(), 0L, properties.getRefreshSeconds(), false, juheType);
    }
    synchronized (lock) {
      refreshIfStale(juheType);
      TypeSlot slot = slots.get(juheType);
      List<NewsItemDto> items = slot == null ? List.of() : slot.items;
      long ms =
          slot == null || slot.lastSuccessAt == null ? 0L : slot.lastSuccessAt.toEpochMilli();
      return new NewsHeadlinesPayload(
          items, ms, properties.getRefreshSeconds(), true, juheType);
    }
  }

  /**
   * 详情：优先读详情缓存；否则在列表索引预热后请求 {@code contentUrl}，与列表项字段合并；上游失败时仅返回列表项与空正文。
   */
  public Optional<NewsDetailResult> headlineDetail(String uniquekey) {
    if (uniquekey == null || uniquekey.isBlank()) {
      return Optional.empty();
    }
    String key = uniquekey.trim();
    if (!juheConfigured()) {
      return Optional.empty();
    }
    synchronized (lock) {
      DetailSlot slot = detailByKey.get(key);
      if (slot != null && !detailCacheExpired(slot.cachedAt)) {
        return Optional.of(slot.result);
      }

      refreshIfStale(JuheNewsTypes.normalize(properties.getType()));
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

  /** 详情上游失败时：有列表缓存则返回空正文并写入详情缓存，否则 not_found。 */
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

  private boolean juheConfigured() {
    return properties.isEnabled() && notBlank(properties.getKey());
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
    if (cachedAt == null) {
      return true;
    }
    return Duration.between(cachedAt, Instant.now()).getSeconds() >= properties.getRefreshSeconds();
  }

  private void refreshIfStale(String juheType) {
    if (!juheConfigured()) {
      return;
    }
    Instant now = Instant.now();
    TypeSlot slot = slots.computeIfAbsent(juheType, k -> new TypeSlot());
    if (!listSlotCooldownElapsed(slot, now)) {
      return;
    }
    slot.lastRemoteAttempt = now;
    try {
      List<NewsItemDto> parsed = fetchRemoteList(juheType);
      slot.items = Collections.unmodifiableList(parsed);
      slot.lastSuccessAt = Instant.now();
    } catch (Exception e) {
      log.warn("juhe news fetch failed type={}: {}", juheType, e.getMessage());
    }
    rebuildByUniquekeyIndex();
  }

  private List<NewsItemDto> fetchRemoteList(String juheType) throws Exception {
    String body = restTemplate.getForObject(juheListUri(juheType), String.class);
    return parseListBody(body);
  }

  private ContentFetch fetchRemoteContent(String uniquekey) throws Exception {
    String body = restTemplate.getForObject(juheContentUri(uniquekey), String.class);
    return parseContentBody(body, uniquekey);
  }

  private URI juheListUri(String juheType) {
    return UriComponentsBuilder.fromHttpUrl(properties.getListUrl())
        .queryParam("key", properties.getKey())
        .queryParam("type", juheType)
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

  /** 距上次列表拉取未满 {@link JuheNewsProperties#getRefreshSeconds()} 则跳过，省配额。 */
  private boolean listSlotCooldownElapsed(TypeSlot slot, Instant now) {
    if (slot.lastRemoteAttempt == null) {
      return true;
    }
    return Duration.between(slot.lastRemoteAttempt, now).getSeconds()
        >= properties.getRefreshSeconds();
  }

  private void rebuildByUniquekeyIndex() {
    Map<String, NewsItemDto> m = new LinkedHashMap<>();
    for (TypeSlot s : slots.values()) {
      for (NewsItemDto it : s.items) {
        m.put(it.getUniquekey(), it);
      }
    }
    byUniquekey = Collections.unmodifiableMap(m);
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
        firstNonBlank(
            text(result, "content"),
            text(result, "html"),
            text(result, "news_content"),
            text(result, "text"));
    NewsItemDto item = mapJsonToItem(result);
    if (item == null) {
      item = mapContentResultFallback(result, requestUniquekey);
    }
    if (item == null) {
      return ContentFetch.fail();
    }
    return new ContentFetch(true, item, html);
  }

  /** 详情接口有时仅返回正文等字段，用请求参数 uniquekey 与 result 内零散字段拼出 {@link NewsItemDto}。 */
  private NewsItemDto mapContentResultFallback(JsonNode result, String requestUniquekey) {
    String uk = firstNonBlank(text(result, "uniquekey"), requestUniquekey);
    if (uk.isEmpty()) {
      return null;
    }
    String title =
        firstNonBlank(text(result, "title"), text(result, "title_detail"), text(result, "topic"));
    if (title.isEmpty()) {
      title = "资讯详情";
    }
    return new NewsItemDto(
        uk,
        title,
        text(result, "date"),
        text(result, "category"),
        text(result, "author_name"),
        text(result, "url"),
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
    return notBlank(a) ? a : (b == null ? "" : b);
  }

  private NewsItemDto mapJsonToItem(JsonNode n) {
    String uniquekey = text(n, "uniquekey");
    String title = text(n, "title");
    if (uniquekey.isEmpty() || title.isEmpty()) {
      return null;
    }
    return new NewsItemDto(
        uniquekey,
        title,
        text(n, "date"),
        text(n, "category"),
        text(n, "author_name"),
        text(n, "url"),
        thumbnailFromNode(n));
  }

  private static String thumbnailFromNode(JsonNode n) {
    return firstNonBlank(
        text(n, "thumbnail_pic_s"),
        text(n, "thumbnail_pic_s02"),
        text(n, "thumbnail_pic_s03"));
  }

  private static int juheErrorCode(JsonNode root) {
    return root.path("error_code").asInt(-1);
  }

  private static String text(JsonNode n, String field) {
    JsonNode v = n.path(field);
    return v.isMissingNode() || v.isNull() ? "" : v.asText("").trim();
  }

  private static String firstNonBlank(String... xs) {
    for (String x : xs) {
      if (x != null && !x.isBlank()) {
        return x.trim();
      }
    }
    return "";
  }

  private static boolean notBlank(String s) {
    return s != null && !s.isBlank();
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
