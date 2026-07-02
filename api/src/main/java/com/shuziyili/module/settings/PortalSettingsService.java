package com.shuziyili.module.settings;

import com.shuziyili.config.JuheConfigSupport;
import com.shuziyili.config.JuheNewsProperties;
import com.shuziyili.config.JuheWeatherProperties;
import com.shuziyili.config.NewsProperties;
import com.shuziyili.config.TencentConfigSupport;
import com.shuziyili.config.TencentNewsProperties;
import com.shuziyili.config.TencentWeatherProperties;
import com.shuziyili.config.TianAreaNewsProperties;
import com.shuziyili.config.WeatherProperties;
import com.shuziyili.config.WeatherProviderId;
import com.shuziyili.module.news.NewsJsonSupport;
import com.shuziyili.module.news.NewsProviderId;
import java.time.Clock;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 门户配置运行时读取：管理后台写入 DB，未设置时回退 {@code application.yml} / env。
 *
 * <p>API Key 仍仅由部署环境提供，不在此表存储。
 */
@Service
public class PortalSettingsService {

  private final Clock clock = Clock.systemUTC();
  private final PortalSettingRepository repository;
  private final NewsProperties newsProperties;
  private final WeatherProperties weatherProperties;
  private final TianAreaNewsProperties tianAreaNewsProperties;
  private final JuheNewsProperties juheNewsProperties;
  private final JuheWeatherProperties juheWeatherProperties;
  private final TencentNewsProperties tencentNewsProperties;
  private final TencentWeatherProperties tencentWeatherProperties;

  private volatile Map<String, String> cached = Map.of();

  public PortalSettingsService(
      PortalSettingRepository repository,
      NewsProperties newsProperties,
      WeatherProperties weatherProperties,
      TianAreaNewsProperties tianAreaNewsProperties,
      JuheNewsProperties juheNewsProperties,
      JuheWeatherProperties juheWeatherProperties,
      TencentNewsProperties tencentNewsProperties,
      TencentWeatherProperties tencentWeatherProperties) {
    this.repository = repository;
    this.newsProperties = newsProperties;
    this.weatherProperties = weatherProperties;
    this.tianAreaNewsProperties = tianAreaNewsProperties;
    this.juheNewsProperties = juheNewsProperties;
    this.juheWeatherProperties = juheWeatherProperties;
    this.tencentNewsProperties = tencentNewsProperties;
    this.tencentWeatherProperties = tencentWeatherProperties;
  }

  @PostConstruct
  void loadOnStartup() {
    reloadCache();
  }

  public void reloadCache() {
    Map<String, String> next = new LinkedHashMap<>();
    for (PortalSettingEntity row : repository.findAll()) {
      next.put(row.getSettingKey(), row.getSettingValue());
    }
    cached = Map.copyOf(next);
  }

  public NewsProviderId resolveNewsProviderId() {
    String raw = cached.get(PortalSettingKeys.NEWS_PROVIDER);
    if (NewsJsonSupport.notBlank(raw)) {
      return NewsProviderId.from(raw);
    }
    return newsProperties.resolveProviderId();
  }

  public WeatherProviderId resolveWeatherProviderId() {
    String raw = cached.get(PortalSettingKeys.WEATHER_PROVIDER);
    if (NewsJsonSupport.notBlank(raw)) {
      return WeatherProviderId.from(raw);
    }
    return weatherProperties.resolveProviderId();
  }

  public boolean isHomeAreaNewsEnabled() {
    String raw = cached.get(PortalSettingKeys.HOME_AREA_NEWS_ENABLED);
    if (raw == null || raw.isBlank()) {
      return true;
    }
    return parseBoolean(raw, true);
  }

  /** 天聚地区名：DB 覆盖 env 默认，供主资讯（tianapi）与首页地区块共用。 */
  public String effectiveTianapiAreaname() {
    String raw = cached.get(PortalSettingKeys.TIANAPI_AREANAME);
    if (NewsJsonSupport.notBlank(raw)) {
      return raw.trim();
    }
    String fromEnv = tianAreaNewsProperties.getAreaname();
    return fromEnv == null ? "" : fromEnv.trim();
  }

  /** 管理后台 GET：当前生效值 + env 默认 + 各上游是否已配置 Key。 */
  @Transactional(readOnly = true)
  public Map<String, Object> adminView() {
    String newsProvider = resolveNewsProviderId().name().toLowerCase();
    String weatherProvider = resolveWeatherProviderId().name().toLowerCase();
    boolean homeEnabled = isHomeAreaNewsEnabled();
    String areaname = effectiveTianapiAreaname();

    Map<String, Object> envDefaults = new LinkedHashMap<>();
    envDefaults.put("newsProvider", newsProperties.resolveProviderId().name().toLowerCase());
    envDefaults.put("weatherProvider", weatherProperties.resolveProviderId().name().toLowerCase());
    envDefaults.put("tianapiAreaname", trimOrEmpty(tianAreaNewsProperties.getAreaname()));

    Map<String, Object> upstream = buildUpstreamStatus();
    Map<String, Object> dbOverrides = dbOverridesSnapshot();

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("newsProvider", newsProvider);
    body.put("weatherProvider", weatherProvider);
    body.put("homeAreaNewsEnabled", homeEnabled);
    body.put("tianapiAreaname", areaname);
    body.put("envDefaults", envDefaults);
    body.put("upstream", upstream);
    body.put("dbOverrides", dbOverrides);
    body.put("sources", adminDataSources(newsProvider, weatherProvider, homeEnabled, upstream));
    return body;
  }

  /** 管理后台：数据源开关或地区名。 */
  @Transactional
  public void adminUpdateItem(String settingKey, String value) {
    if (!NewsJsonSupport.notBlank(settingKey)) {
      throw new IllegalArgumentException("invalid_setting_key");
    }
    String key = settingKey.trim();
    if (key.startsWith("source.")) {
      adminToggleSource(key, parseBoolean(value, false));
      reloadCache();
      return;
    }
    long now = clock.millis();
    if (PortalSettingKeys.TIANAPI_AREANAME.equals(key)) {
      String areaname = value == null ? "" : value.trim();
      if (areaname.length() > 32) {
        throw new IllegalArgumentException("tianapi_areaname_too_long");
      }
      upsert(key, areaname, now);
      reloadCache();
      return;
    }
    throw new IllegalArgumentException("unknown_setting_key");
  }

  private void adminToggleSource(String sourceId, boolean enabled) {
    long now = clock.millis();
    if (enabled && !isSourceConfigured(sourceId)) {
      throw new IllegalArgumentException("source_not_configured");
    }
    switch (sourceId) {
      case PortalSettingKeys.SOURCE_JUHE_NEWS:
        if (enabled) {
          upsert(PortalSettingKeys.NEWS_PROVIDER, "juhe", now);
        } else if (resolveNewsProviderId() == NewsProviderId.JUHE) {
          clearSetting(PortalSettingKeys.NEWS_PROVIDER);
        }
        break;
      case PortalSettingKeys.SOURCE_TIANAPI_NEWS:
        if (enabled) {
          upsert(PortalSettingKeys.NEWS_PROVIDER, "tianapi", now);
        } else if (resolveNewsProviderId() == NewsProviderId.TIANAPI) {
          clearSetting(PortalSettingKeys.NEWS_PROVIDER);
        }
        break;
      case PortalSettingKeys.SOURCE_TENCENT_NEWS:
        if (enabled) {
          upsert(PortalSettingKeys.NEWS_PROVIDER, "tencent", now);
        } else if (resolveNewsProviderId() == NewsProviderId.TENCENT) {
          clearSetting(PortalSettingKeys.NEWS_PROVIDER);
        }
        break;
      case PortalSettingKeys.SOURCE_JUHE_WEATHER:
        if (enabled) {
          upsert(PortalSettingKeys.WEATHER_PROVIDER, "juhe", now);
        } else if (resolveWeatherProviderId() == WeatherProviderId.JUHE) {
          clearSetting(PortalSettingKeys.WEATHER_PROVIDER);
        }
        break;
      case PortalSettingKeys.SOURCE_TENCENT_WEATHER:
        if (enabled) {
          upsert(PortalSettingKeys.WEATHER_PROVIDER, "tencent", now);
        } else if (resolveWeatherProviderId() == WeatherProviderId.TENCENT) {
          clearSetting(PortalSettingKeys.WEATHER_PROVIDER);
        }
        break;
      case PortalSettingKeys.SOURCE_TIANAPI_HOME:
        upsert(PortalSettingKeys.HOME_AREA_NEWS_ENABLED, Boolean.toString(enabled), now);
        break;
      default:
        throw new IllegalArgumentException("unknown_setting_key");
    }
  }

  private boolean isSourceConfigured(String sourceId) {
    Map<String, Object> upstream = buildUpstreamStatus();
    if (PortalSettingKeys.SOURCE_JUHE_NEWS.equals(sourceId)) {
      return upstreamConfigured(upstream.get("juheNews"));
    }
    if (PortalSettingKeys.SOURCE_TIANAPI_NEWS.equals(sourceId)
        || PortalSettingKeys.SOURCE_TIANAPI_HOME.equals(sourceId)) {
      return upstreamConfigured(upstream.get("tianapiNews"));
    }
    if (PortalSettingKeys.SOURCE_TENCENT_NEWS.equals(sourceId)) {
      return upstreamConfigured(upstream.get("tencentNews"));
    }
    if (PortalSettingKeys.SOURCE_JUHE_WEATHER.equals(sourceId)) {
      return upstreamConfigured(upstream.get("juheWeather"));
    }
    if (PortalSettingKeys.SOURCE_TENCENT_WEATHER.equals(sourceId)) {
      return upstreamConfigured(upstream.get("tencentWeather"));
    }
    return false;
  }

  @SuppressWarnings("unchecked")
  private static boolean upstreamConfigured(Object status) {
    if (!(status instanceof Map)) {
      return false;
    }
    Map<String, Object> map = (Map<String, Object>) status;
    Object configured = map.get("configured");
    return Boolean.TRUE.equals(configured);
  }

  private void clearSetting(String key) {
    if (repository.existsById(key)) {
      repository.deleteById(key);
    }
  }

  private List<Map<String, Object>> adminDataSources(
      String newsProvider,
      String weatherProvider,
      boolean homeEnabled,
      Map<String, Object> upstream) {
    List<Map<String, Object>> sources = new ArrayList<>();
    sources.add(
        dataSourceRow(
            PortalSettingKeys.SOURCE_JUHE_NEWS,
            "聚合数据 · 新闻头条",
            "主资讯 /news",
            "news",
            "juhe".equals(newsProvider),
            "juheNews",
            upstream));
    sources.add(
        dataSourceRow(
            PortalSettingKeys.SOURCE_TIANAPI_NEWS,
            "天聚数行 · 地区新闻",
            "主资讯 /news",
            "news",
            "tianapi".equals(newsProvider),
            "tianapiNews",
            upstream));
    sources.add(
        dataSourceRow(
            PortalSettingKeys.SOURCE_TENCENT_NEWS,
            "腾讯新闻 Skills",
            "主资讯 /news",
            "news",
            "tencent".equals(newsProvider),
            "tencentNews",
            upstream));
    sources.add(
        dataSourceRow(
            PortalSettingKeys.SOURCE_JUHE_WEATHER,
            "聚合数据 · 天气预报",
            "天气 /weather",
            "weather",
            "juhe".equals(weatherProvider),
            "juheWeather",
            upstream));
    sources.add(
        dataSourceRow(
            PortalSettingKeys.SOURCE_TENCENT_WEATHER,
            "腾讯天气 Skills",
            "天气 /weather",
            "weather",
            "tencent".equals(weatherProvider),
            "tencentWeather",
            upstream));
    sources.add(
        dataSourceRow(
            PortalSettingKeys.SOURCE_TIANAPI_HOME,
            "天聚数行 · 地区资讯",
            "首页地区块",
            "home",
            homeEnabled,
            "tianapiNews",
            upstream));
    return sources;
  }

  private static Map<String, Object> dataSourceRow(
      String id,
      String label,
      String scope,
      String group,
      boolean enabled,
      String upstreamKey,
      Map<String, Object> upstream) {
    Map<String, Object> row = new LinkedHashMap<>();
    row.put("id", id);
    row.put("label", label);
    row.put("scope", scope);
    row.put("group", group);
    row.put("enabled", enabled);
    Object status = upstream.get(upstreamKey);
    row.put("upstream", status == null ? Map.of() : status);
    return row;
  }

  private void upsert(String key, String value, long updatedAt) {
    PortalSettingEntity row = repository.findById(key).orElseGet(PortalSettingEntity::new);
    row.setSettingKey(key);
    row.setSettingValue(value == null ? "" : value);
    row.setUpdatedAt(updatedAt);
    repository.save(row);
  }

  private Map<String, Object> dbOverridesSnapshot() {
    Map<String, Object> m = new LinkedHashMap<>();
    putIfPresent(m, "newsProvider", cached.get(PortalSettingKeys.NEWS_PROVIDER));
    putIfPresent(m, "weatherProvider", cached.get(PortalSettingKeys.WEATHER_PROVIDER));
    putIfPresent(m, "homeAreaNewsEnabled", cached.get(PortalSettingKeys.HOME_AREA_NEWS_ENABLED));
    putIfPresent(m, "tianapiAreaname", cached.get(PortalSettingKeys.TIANAPI_AREANAME));
    return m;
  }

  private static void putIfPresent(Map<String, Object> target, String key, String raw) {
    if (raw != null && !raw.isBlank()) {
      target.put(key, raw);
    }
  }

  private Map<String, Object> buildUpstreamStatus() {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("juheNews", providerStatus(juheNewsProperties.isEnabled(), juheNewsProperties.getKey()));
    m.put(
        "juheWeather",
        providerStatus(
            juheWeatherProperties.isEnabled(),
            JuheConfigSupport.resolveWeatherApiKey(juheWeatherProperties, juheNewsProperties)));
    m.put(
        "tianapiNews",
        providerStatus(tianAreaNewsProperties.isEnabled(), tianAreaNewsProperties.getKey()));
    m.put("tencentNews", providerStatus(tencentNewsProperties.isEnabled(), tencentNewsProperties.getKey()));
    m.put(
        "tencentWeather",
        providerStatus(
            tencentWeatherProperties.isEnabled(),
            TencentConfigSupport.resolveSkillsApiKey(tencentWeatherProperties, tencentNewsProperties)));
    return m;
  }

  private static Map<String, Object> providerStatus(boolean enabled, String key) {
    boolean configured = enabled && NewsJsonSupport.notBlank(key);
    return Map.of("enabled", enabled, "configured", configured);
  }

  private static boolean parseBoolean(String raw, boolean fallback) {
    String t = raw.trim().toLowerCase();
    if ("true".equals(t) || "1".equals(t) || "yes".equals(t)) {
      return true;
    }
    if ("false".equals(t) || "0".equals(t) || "no".equals(t)) {
      return false;
    }
    return fallback;
  }

  private static String trimOrEmpty(String raw) {
    return raw == null ? "" : raw.trim();
  }
}
