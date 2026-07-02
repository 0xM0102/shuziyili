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
   *   <li>{@code juhe} — 聚合「新闻头条」（侧栏 {@code type} 频道）
   *   <li>{@code tianapi} — 天聚「地区新闻」（作主资讯时）
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
    return NewsProviderId.from(provider);
  }
}
