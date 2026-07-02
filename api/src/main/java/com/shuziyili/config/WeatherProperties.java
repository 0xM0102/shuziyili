package com.shuziyili.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** 门户天气数据源：{@code juhe}（聚合简单天气）或 {@code tencent}（腾讯 Skills）。 */
@ConfigurationProperties(prefix = "shuziyili.weather")
public class WeatherProperties {

  private String provider = "juhe";

  public String getProvider() {
    return provider;
  }

  public void setProvider(String provider) {
    this.provider = provider;
  }

  public WeatherProviderId resolveProviderId() {
    return WeatherProviderId.from(provider);
  }
}
