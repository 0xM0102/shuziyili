package com.shuziyili.module.news;

/** 门户资讯上游实现标识（与 {@code shuziyili.news.provider} 对应）。 */
public enum NewsProviderId {
  JUHE,
  TIANAPI,
  TENCENT;

  public static NewsProviderId from(String raw) {
    if (raw == null || raw.isBlank()) {
      return JUHE;
    }
    String p = raw.trim().toLowerCase();
    if ("tianapi".equals(p)) {
      return TIANAPI;
    }
    if ("tencent".equals(p) || "qqnews".equals(p)) {
      return TENCENT;
    }
    return JUHE;
  }
}
