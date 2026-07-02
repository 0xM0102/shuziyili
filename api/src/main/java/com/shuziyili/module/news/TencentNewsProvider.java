package com.shuziyili.module.news;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shuziyili.config.TencentNewsProperties;
import com.shuziyili.config.TencentSkillsHttp;
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

/**
 * 腾讯新闻 Skills OpenAPI：热点榜 {@code /api/v1/agent/hot_rank_list}、关键词
 * {@code /api/v1/agent/search}（{@code query.search} + {@code query.query_id}）。
 *
 * <p>启用条件：{@code shuziyili.news.provider=tencent} 且 {@code shuziyili.tencent.news.enabled=true} 并配置
 * {@code key}（在 <a href="https://news.qq.com/exchange?scene=appkey">news.qq.com/exchange</a> 生成）。
 *
 * <p>无独立正文接口：详情页使用列表字段 {@code news_content} 或 {@code abstract}。
 */
@Service
public class TencentNewsProvider implements NewsProvider, NewsChannelDetailLookup.Refresher {

  private static final Logger log = LoggerFactory.getLogger(TencentNewsProvider.class);

  private static final String HOT_RANK_PATH = "/api/v1/agent/hot_rank_list";
  private static final String SEARCH_PATH = "/api/v1/agent/search";
  private static final String SEARCH_SCENE = "news-skill";
  private static final String SEARCH_QUERY_ID_FIRST_PAGE = "0";
  private static final int HOT_RANK_MAX_LIMIT = 50;

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;
  private final TencentNewsProperties properties;

  private final Object lock = new Object();

  private static final class ChannelSlot {
    List<NewsItemDto> items = List.of();
    Map<String, String> bodies = Map.of();
    Instant lastRemoteAttempt;
    Instant lastSuccessAt;
  }

  private final Map<String, ChannelSlot> slots = new LinkedHashMap<>();
  private Map<String, NewsItemDto> byUniquekey = Map.of();
  private Map<String, String> bodyByKey = Map.of();

  public TencentNewsProvider(
      RestTemplate restTemplate, ObjectMapper objectMapper, TencentNewsProperties properties) {
    this.restTemplate = restTemplate;
    this.objectMapper = objectMapper;
    this.properties = properties;
  }

  @Override
  public NewsProviderId id() {
    return NewsProviderId.TENCENT;
  }

  @Override
  public String attribution() {
    return NewsAttributions.TENCENT;
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
          uniquekey, channelType, byUniquekey, bodyByKey, this);
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
      slot.bodies = Collections.unmodifiableMap(batch.extraByKey);
      slot.lastSuccessAt = Instant.now();
    } catch (Exception e) {
      log.warn("tencent news fetch failed channel={}: {}", channel, e.getMessage());
    }
    rebuildIndexes();
  }

  private boolean upstreamConfigured() {
    return properties.isEnabled() && NewsJsonSupport.notBlank(properties.getKey());
  }

  private NewsListBatch fetchRemoteList(String channel) throws Exception {
    if (NewsChannelTypes.TOP.equals(channel)) {
      return fetchHotRankList(channel);
    }
    String keyword = NewsChannelTypes.tencentSearchQueryForChannel(channel);
    NewsListBatch searched = fetchSearchList(keyword, channel);
    if (!searched.items.isEmpty()) {
      return searched;
    }
    // 搜索无结果时，从热点榜按关键词兜底（条数通常很少）
    if (NewsJsonSupport.notBlank(keyword)) {
      return filterHotRankByKeyword(keyword, channel);
    }
    return NewsListBatch.empty();
  }

  private NewsListBatch fetchHotRankList(String channel) throws Exception {
    Map<String, Object> body = Map.of("limit", hotRankLimit());
    String responseBody = postJson(HOT_RANK_PATH, body);
    return TencentNewsJson.parseListResponse(
        objectMapper, responseBody, NewsChannelTypes.labelForChannel(channel));
  }

  private NewsListBatch fetchSearchList(String keyword, String channel) throws Exception {
    Map<String, Object> query =
        Map.of("search", keyword, "query_id", SEARCH_QUERY_ID_FIRST_PAGE);
    Map<String, Object> body =
        Map.of(
            "limit", listLimit(),
            "scene", SEARCH_SCENE,
            "query", query);
    String responseBody = postJson(SEARCH_PATH, body);
    return TencentNewsJson.parseListResponse(
        objectMapper, responseBody, NewsChannelTypes.labelForChannel(channel));
  }

  private NewsListBatch filterHotRankByKeyword(String keyword, String channel) throws Exception {
    NewsListBatch hot = fetchHotRankList(channel);
    List<NewsItemDto> filtered = new ArrayList<>();
    Map<String, String> bodies = new LinkedHashMap<>();
    for (NewsItemDto item : hot.items) {
      String detail = hot.extraByKey.getOrDefault(item.getUniquekey(), "");
      if (item.getTitle().contains(keyword) || detail.contains(keyword)) {
        filtered.add(item);
        if (NewsJsonSupport.notBlank(detail)) {
          bodies.put(item.getUniquekey(), detail);
        }
      }
    }
    return new NewsListBatch(filtered, bodies);
  }

  private int hotRankLimit() {
    return Math.min(HOT_RANK_MAX_LIMIT, listLimit());
  }

  private int listLimit() {
    return Math.max(1, properties.getPageSize());
  }

  private String postJson(String path, Map<String, Object> body) throws Exception {
    return TencentSkillsHttp.postJson(
        restTemplate,
        objectMapper,
        properties.getBaseUrl(),
        properties.getKey(),
        properties.getCallerSkill(),
        path,
        body);
  }

  private void rebuildIndexes() {
    List<Iterable<NewsItemDto>> itemLists = new ArrayList<>();
    List<Map<String, String>> bodyMaps = new ArrayList<>();
    for (ChannelSlot slot : slots.values()) {
      itemLists.add(slot.items);
      bodyMaps.add(slot.bodies);
    }
    byUniquekey = NewsJsonSupport.indexItemsFirstWins(itemLists);
    bodyByKey = NewsJsonSupport.mergeStringMaps(bodyMaps);
  }
}
