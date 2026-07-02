package com.shuziyili.config;

import com.shuziyili.module.news.NewsJsonSupport;

/** 腾讯 Skills OpenAPI Key 解析：天气可回退共用新闻 Key。 */
public final class TencentConfigSupport {

  private TencentConfigSupport() {}

  public static String resolveSkillsApiKey(
      TencentWeatherProperties weather, TencentNewsProperties news) {
    if (NewsJsonSupport.notBlank(weather.getKey())) {
      return weather.getKey().trim();
    }
    if (news.isEnabled() && NewsJsonSupport.notBlank(news.getKey())) {
      return news.getKey().trim();
    }
    return "";
  }
}
