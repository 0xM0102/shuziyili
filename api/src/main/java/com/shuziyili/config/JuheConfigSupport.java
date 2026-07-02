package com.shuziyili.config;

import com.shuziyili.module.news.NewsJsonSupport;

/** Juhe 多接口 Key 解析：天气可回退共用资讯 Key。 */
public final class JuheConfigSupport {

  private JuheConfigSupport() {}

  /** 优先 {@code juhe.weather.key}，否则在资讯已启用时使用 {@code juhe.news.key}。 */
  public static String resolveWeatherApiKey(
      JuheWeatherProperties weather, JuheNewsProperties news) {
    if (NewsJsonSupport.notBlank(weather.getKey())) {
      return weather.getKey().trim();
    }
    if (news.isEnabled() && NewsJsonSupport.notBlank(news.getKey())) {
      return news.getKey().trim();
    }
    return "";
  }
}
