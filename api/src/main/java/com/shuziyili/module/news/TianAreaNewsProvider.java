package com.shuziyili.module.news;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shuziyili.config.TianAreaNewsProperties;
import com.shuziyili.module.settings.PortalSettingsService;
import java.net.URI;
import java.nio.charset.StandardCharsets;
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
 * 天聚数行「地区新闻」（文档 ID 154）：按 {@code areaname} 拉省级资讯，侧栏频道映射为 {@code word} 关键词。
 *
 * <p>无独立正文接口：详情页 {@code contentHtml} 使用列表字段 {@code description}。
 *
 * @see <a href="https://www.tianapi.com/apiview/154">地区新闻 API</a>
 */
@Service
public class TianAreaNewsProvider implements NewsProvider, NewsChannelDetailLookup.Refresher {

  private static final Logger log = LoggerFactory.getLogger(TianAreaNewsProvider.class);

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;
  private final TianAreaNewsProperties properties;
  private final PortalSettingsService portalSettingsService;

  private final Object lock = new Object();

  private static final class ChannelSlot {
    List<NewsItemDto> items = List.of();
    Map<String, String> descriptions = Map.of();
    Instant lastRemoteAttempt;
    Instant lastSuccessAt;
  }

  private final Map<String, ChannelSlot> slots = new LinkedHashMap<>();
  private Map<String, NewsItemDto> byUniquekey = Map.of();
  private Map<String, String> descriptionByKey = Map.of();

  public TianAreaNewsProvider(
      RestTemplate restTemplate,
      ObjectMapper objectMapper,
      TianAreaNewsProperties properties,
      PortalSettingsService portalSettingsService) {
    this.restTemplate = restTemplate;
    this.objectMapper = objectMapper;
    this.properties = properties;
    this.portalSettingsService = portalSettingsService;
  }

  @Override
  public NewsProviderId id() {
    return NewsProviderId.TIANAPI;
  }

  @Override
  public String attribution() {
    return NewsAttributions.TIANAPI;
  }

  @Override
  public NewsHeadlinesPayload headlines(String typeParam) {
    String channel = NewsChannelTypes.normalize(typeParam);
    if (!upstreamConfigured()) {
      return NewsHeadlinesPayload.unconfigured(channel, properties.getRefreshSeconds());
    }
    synchronized (lock) {
      refreshIfStale(channel);
      ChannelSlot slot = slots.get(channel);
      List<NewsItemDto> items = slot == null ? List.of() : slot.items;
      Instant lastSuccess = slot == null ? null : slot.lastSuccessAt;
      return NewsHeadlinesPayload.cached(
          items, lastSuccess, properties.getRefreshSeconds(), channel);
    }
  }

  @Override
  public Optional<NewsDetailResult> headlineDetail(String uniquekey, String channelType) {
    if (!upstreamConfigured()) {
      return Optional.empty();
    }
    synchronized (lock) {
      return NewsChannelDetailLookup.detailFromListCache(
          uniquekey, channelType, byUniquekey, descriptionByKey, this);
    }
  }

  @Override
  public void refreshIfStale(String channel) {
    if (!upstreamConfigured()) {
      return;
    }
    Instant now = Instant.now();
    ChannelSlot slot = slots.computeIfAbsent(channel, k -> new ChannelSlot());
    if (!NewsJsonSupport.refreshCooldownElapsed(
        slot.lastRemoteAttempt, now, properties.getRefreshSeconds())) {
      return;
    }
    slot.lastRemoteAttempt = now;
    try {
      NewsListBatch batch = fetchRemoteList(channel);
      slot.items = Collections.unmodifiableList(batch.items);
      slot.descriptions = Collections.unmodifiableMap(batch.extraByKey);
      slot.lastSuccessAt = Instant.now();
    } catch (Exception e) {
      log.warn("tianapi areanews fetch failed channel={}: {}", channel, e.getMessage());
    }
    rebuildIndexes();
  }

  public String summaryFor(String uniquekey) {
    if (!NewsJsonSupport.notBlank(uniquekey)) {
      return "";
    }
    synchronized (lock) {
      return descriptionByKey.getOrDefault(uniquekey.trim(), "");
    }
  }

  /** 管理端修改地区名或 Provider 后清空进程内缓存。 */
  public void resetCache() {
    synchronized (lock) {
      slots.clear();
      byUniquekey = Map.of();
      descriptionByKey = Map.of();
    }
  }

  private boolean upstreamConfigured() {
    return properties.isEnabled()
        && NewsJsonSupport.notBlank(properties.getKey())
        && NewsJsonSupport.notBlank(portalSettingsService.effectiveTianapiAreaname());
  }

  private NewsListBatch fetchRemoteList(String channel) throws Exception {
    String body = restTemplate.getForObject(listUri(channel), String.class);
    return parseListBody(body);
  }

  private URI listUri(String channel) {
    UriComponentsBuilder builder =
        UriComponentsBuilder.fromHttpUrl(properties.getListUrl())
            .queryParam("key", properties.getKey())
            .queryParam("areaname", portalSettingsService.effectiveTianapiAreaname())
            .queryParam("page", "1");
    String word = NewsChannelTypes.tianAreaNewsKeywordForChannel(channel);
    if (NewsJsonSupport.notBlank(word)) {
      builder.queryParam("word", word);
    }
    return builder.build().encode(StandardCharsets.UTF_8).toUri();
  }

  private void rebuildIndexes() {
    List<Iterable<NewsItemDto>> itemLists = new ArrayList<>();
    List<Map<String, String>> descriptionMaps = new ArrayList<>();
    for (ChannelSlot slot : slots.values()) {
      itemLists.add(slot.items);
      descriptionMaps.add(slot.descriptions);
    }
    byUniquekey = NewsJsonSupport.indexItemsFirstWins(itemLists);
    descriptionByKey = NewsJsonSupport.mergeStringMaps(descriptionMaps);
  }

  private NewsListBatch parseListBody(String body) throws Exception {
    if (body == null || body.isBlank()) {
      return NewsListBatch.empty();
    }
    JsonNode root = objectMapper.readTree(body);
    if (root.path("code").asInt(-1) != 200) {
      log.warn(
          "tianapi areanews list code={} msg={}",
          root.path("code").asInt(-1),
          root.path("msg").asText(""));
      return NewsListBatch.empty();
    }
    JsonNode listNode = extractNewsListNode(root.path("result"));
    if (listNode == null || !listNode.isArray()) {
      return NewsListBatch.empty();
    }
    List<NewsItemDto> items = new ArrayList<>();
    Map<String, String> descriptions = new LinkedHashMap<>();
    int limit = Math.max(1, properties.getPageSize());
    for (JsonNode node : listNode) {
      if (items.size() >= limit) {
        break;
      }
      NewsItemDto item = mapTianItem(node);
      if (item != null) {
        items.add(item);
        String description = NewsJsonSupport.text(node, "description");
        if (NewsJsonSupport.notBlank(description)) {
          descriptions.put(item.getUniquekey(), description);
        }
      }
    }
    return new NewsListBatch(items, descriptions);
  }

  /** 兼容 {@code newslist}、{@code list} 或 result 直接为数组等结构差异。 */
  private static JsonNode extractNewsListNode(JsonNode result) {
    if (result == null || result.isMissingNode() || result.isNull()) {
      return null;
    }
    if (result.isArray()) {
      return result;
    }
    JsonNode newslist = result.path("newslist");
    if (newslist.isArray()) {
      return newslist;
    }
    JsonNode list = result.path("list");
    if (list.isArray()) {
      return list;
    }
    return null;
  }

  private NewsItemDto mapTianItem(JsonNode node) {
    String id = NewsJsonSupport.text(node, "id");
    String title = NewsJsonSupport.text(node, "title");
    if (id.isEmpty() || title.isEmpty()) {
      return null;
    }
    return new NewsItemDto(
        id,
        title,
        NewsJsonSupport.text(node, "ctime"),
        portalSettingsService.effectiveTianapiAreaname(),
        NewsJsonSupport.text(node, "source"),
        NewsJsonSupport.text(node, "url"),
        NewsJsonSupport.text(node, "picUrl"));
  }
}
