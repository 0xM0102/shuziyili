package com.shuziyili.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 腾讯天气 Skills OpenAPI（与新闻共用 Key，{@code Caller-Skill: tencent-weather}）。
 *
 * @see <a href="https://news.qq.com/exchange?scene=appkey">腾讯新闻 Skills</a>
 */
@ConfigurationProperties(prefix = "shuziyili.tencent.weather")
public class TencentWeatherProperties {

  private boolean enabled = false;

  /** 为空时回退 {@link TencentNewsProperties#getKey()}。 */
  private String key = "";

  private String baseUrl = "https://openapi.inews.qq.com";

  private String callerSkill = "tencent-weather";

  /** 门户默认展示地区（伊宁市）。 */
  private String defaultAdcode = "654002";

  /** 同一 adcode 缓存秒数。 */
  private int refreshSeconds = 600;

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

  public String getDefaultAdcode() {
    return defaultAdcode;
  }

  public void setDefaultAdcode(String defaultAdcode) {
    this.defaultAdcode = defaultAdcode;
  }

  public int getRefreshSeconds() {
    return refreshSeconds;
  }

  public void setRefreshSeconds(int refreshSeconds) {
    this.refreshSeconds = refreshSeconds;
  }
}
