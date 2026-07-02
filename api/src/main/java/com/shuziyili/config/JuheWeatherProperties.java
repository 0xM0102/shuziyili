package com.shuziyili.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * 聚合数据「天气预报」配置（文档 ID 73）。
 *
 * @see <a href="https://www.juhe.cn/docs/api/id/73">Juhe 天气预报 API</a>
 */
@ConfigurationProperties(prefix = "shuziyili.juhe.weather")
public class JuheWeatherProperties {

  private boolean enabled = false;
  private String key = "";
  private String queryUrl = "https://apis.juhe.cn/simpleWeather/query";
  private String lifeUrl = "https://apis.juhe.cn/simpleWeather/life";
  private String defaultAdcode = "654002";
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

  public String getQueryUrl() {
    return queryUrl;
  }

  public void setQueryUrl(String queryUrl) {
    this.queryUrl = queryUrl;
  }

  public String getLifeUrl() {
    return lifeUrl;
  }

  public void setLifeUrl(String lifeUrl) {
    this.lifeUrl = lifeUrl;
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
