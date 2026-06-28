package com.shuziyili.config;

import com.shuziyili.module.news.NewsProviderId;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 门户资讯模块数据源选择。
 *
 * <p>多套实现均已就绪，通过 {@code provider} 切换；未启用的一方仅需保持 {@code enabled=false}（或留空密钥）。
 */
@ConfigurationProperties(prefix = "shuziyili.news")
public class NewsProperties {

  /**
   * 当前生效的数据源：
   *
   * <ul>
   *   <li>{@code juhe} — 聚合数据「新闻头条」全国频道
   *   <li>{@code tianapi} — 天聚数行「地区新闻」省级资讯
   *   <li>{@code tencent} — 腾讯新闻 Skills OpenAPI（热点榜 / 搜索）
   * </ul>
   */
  private String provider = "juhe";

  public String getProvider() {
    return provider;
  }

  public void setProvider(String provider) {
    this.provider = provider;
  }

  public NewsProviderId resolveProviderId() {
    if (provider == null || provider.isBlank()) {
      return NewsProviderId.JUHE;
    }
    String p = provider.trim().toLowerCase();
    if ("tianapi".equals(p)) {
      return NewsProviderId.TIANAPI;
    }
    if ("tencent".equals(p) || "qqnews".equals(p)) {
      return NewsProviderId.TENCENT;
    }
    return NewsProviderId.JUHE;
  }
}
