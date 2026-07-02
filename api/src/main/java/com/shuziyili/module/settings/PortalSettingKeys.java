package com.shuziyili.module.settings;

/** {@code portal_settings.setting_key} 常量。 */
public final class PortalSettingKeys {

  public static final String NEWS_PROVIDER = "news.provider";
  public static final String WEATHER_PROVIDER = "weather.provider";
  public static final String HOME_AREA_NEWS_ENABLED = "home.area_news.enabled";
  public static final String TIANAPI_AREANAME = "tianapi.areaname";

  /** 管理后台数据源开关 ID（写入 {@link PortalSettingsService#adminToggleSource}）。 */
  public static final String SOURCE_JUHE_NEWS = "source.juhe-news";
  public static final String SOURCE_TIANAPI_NEWS = "source.tianapi-news";
  public static final String SOURCE_TENCENT_NEWS = "source.tencent-news";
  public static final String SOURCE_JUHE_WEATHER = "source.juhe-weather";
  public static final String SOURCE_TENCENT_WEATHER = "source.tencent-weather";
  public static final String SOURCE_TIANAPI_HOME = "source.tianapi-home";

  private PortalSettingKeys() {}
}
