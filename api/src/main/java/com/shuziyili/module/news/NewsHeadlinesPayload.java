package com.shuziyili.module.news;

import java.util.List;

public class NewsHeadlinesPayload {

  private final List<NewsItemDto> items;
  private final long cachedAtEpochMs;
  private final int refreshIntervalSeconds;
  private final boolean upstreamConfigured;
  /** 实际请求的 Juhe type（如 top、guonei）。 */
  private final String juheType;

  public NewsHeadlinesPayload(
      List<NewsItemDto> items,
      long cachedAtEpochMs,
      int refreshIntervalSeconds,
      boolean upstreamConfigured,
      String juheType) {
    this.items = items;
    this.cachedAtEpochMs = cachedAtEpochMs;
    this.refreshIntervalSeconds = refreshIntervalSeconds;
    this.upstreamConfigured = upstreamConfigured;
    this.juheType = juheType;
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

  public String getJuheType() {
    return juheType;
  }
}
