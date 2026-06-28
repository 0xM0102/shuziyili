package com.shuziyili.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 腾讯新闻 Skills OpenAPI 配置。
 *
 * <p>API Key 在 <a href="https://news.qq.com/exchange?scene=appkey">腾讯新闻 Skills</a> 登录后生成；
 * 鉴权方式为 {@code Authorization: Bearer &lt;key&gt;}。
 *
 * @see com.shuziyili.module.news.TencentNewsProvider
 */
@ConfigurationProperties(prefix = "shuziyili.tencent.news")
public class TencentNewsProperties {

  /** 为 true 且配置了 key 时，{@code provider=tencent} 才会请求上游。 */
  private boolean enabled = false;

  private String key = "";

  /** 默认生产 OpenAPI 根地址（路径见 {@link com.shuziyili.module.news.TencentNewsProvider}）。 */
  private String baseUrl = "https://openapi.inews.qq.com";

  /** 与官方 CLI 一致，用于上游统计。 */
  private String callerSkill = "tencent-news";

  private int pageSize = 20;

  /** 两次真实请求上游之间的最短间隔（秒），默认 3600。 */
  private int refreshSeconds = 3600;

  public boolean isEnabled() {
    return enabled;
  }

  public void setEnabled(boolean enabled) {
    this.enabled = enabled;
  }

  public String getKey() {
    return key;
  }

  public void setKey(String key) {
    this.key = key;
  }

  public String getBaseUrl() {
    return baseUrl;
  }

  public void setBaseUrl(String baseUrl) {
    this.baseUrl = baseUrl;
  }

  public String getCallerSkill() {
    return callerSkill;
  }

  public void setCallerSkill(String callerSkill) {
    this.callerSkill = callerSkill;
  }

  public int getPageSize() {
    return pageSize;
  }

  public void setPageSize(int pageSize) {
    this.pageSize = pageSize;
  }

  public int getRefreshSeconds() {
    return refreshSeconds;
  }

  public void setRefreshSeconds(int refreshSeconds) {
    this.refreshSeconds = refreshSeconds;
  }
}
