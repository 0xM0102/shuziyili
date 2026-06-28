package com.shuziyili.module.news;

import java.time.Instant;
import java.util.List;

public class NewsHeadlinesPayload {

  private final List<NewsItemDto> items;
  private final long cachedAtEpochMs;
  private final int refreshIntervalSeconds;
  private final boolean upstreamConfigured;
  /** 实际请求的侧栏频道 slug（如 top、guonei）。 */
  private final String channelType;

  public NewsHeadlinesPayload(
      List<NewsItemDto> items,
      long cachedAtEpochMs,
      int refreshIntervalSeconds,
      boolean upstreamConfigured,
      String channelType) {
    this.items = items;
    this.cachedAtEpochMs = cachedAtEpochMs;
    this.refreshIntervalSeconds = refreshIntervalSeconds;
    this.upstreamConfigured = upstreamConfigured;
    this.channelType = channelType;
  }

  static NewsHeadlinesPayload unconfigured(String channelType, int refreshIntervalSeconds) {
    return new NewsHeadlinesPayload(List.of(), 0L, refreshIntervalSeconds, false, channelType);
  }

  static NewsHeadlinesPayload cached(
      List<NewsItemDto> items,
      Instant lastSuccessAt,
      int refreshIntervalSeconds,
      String channelType) {
    long ms = lastSuccessAt == null ? 0L : lastSuccessAt.toEpochMilli();
    return new NewsHeadlinesPayload(items, ms, refreshIntervalSeconds, true, channelType);
  }

  public List<NewsItemDto> getItems() {
    return items;
  }

  public long getCachedAtEpochMs() {
    return cachedAtEpochMs;
  }

  public int getRefreshIntervalSeconds() {
    return refreshIntervalSeconds;
  }

  public boolean isUpstreamConfigured() {
    return upstreamConfigured;
  }

  public String getChannelType() {
    return channelType;
  }
}
