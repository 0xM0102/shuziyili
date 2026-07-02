package com.shuziyili.module.weather;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shuziyili.config.TencentConfigSupport;
import com.shuziyili.config.TencentNewsProperties;
import com.shuziyili.config.TencentSkillsHttp;
import com.shuziyili.config.TencentWeatherProperties;
import com.shuziyili.config.WeatherProviderId;
import com.shuziyili.module.settings.PortalSettingsService;
import com.shuziyili.module.news.NewsJsonSupport;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WeatherService {

  private static final Logger log = LoggerFactory.getLogger(WeatherService.class);

  private static final String WEATHER_PATH = "/api/v1/agent/weather/comprehensive_weather_info";
  private static final String IP2CITY_PATH = "/api/v1/agent/ip2city";
  private static final String ATTRIBUTION =
      "天气数据来自腾讯天气（https://tianqi.qq.com），数据来源于中国天气网。";
  private static final int WEATHER_CACHE_MAX_SIZE = 256;
  private static final int HOURLY_MAX_ITEMS = 24;
  private static final int WEATHER_FETCH_DEADLINE_SECONDS = 9;

  private static final ExecutorService WEATHER_FETCH_EXECUTOR =
      Executors.newFixedThreadPool(
          4,
          runnable -> {
            Thread thread = new Thread(runnable, "weather-fetch");
            thread.setDaemon(true);
            return thread;
          });

  /**
   * 生活指数展示顺序（对齐腾讯天气常见 12+ 项）；未列出的上游字段仍会追加在末尾。
   */
  private static final List<String> LIFE_INDEX_ORDER =
      List.of(
          "clothes",
          "umbrella",
          "cold",
          "carwash",
          "sports",
          "sunscreen",
          "ultraviolet",
          "morning",
          "makeup",
          "drying",
          "fish",
          "tourism",
          "comfort",
          "diffusion",
          "traffic",
          "sunglasses",
          "allergy",
          "airconditioner",
          "mood",
          "chill",
          "heatstroke",
          "dry");

  private static final Set<String> LIFE_INDEX_SKIP_KEYS = Set.of("time");

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;
  private final PortalSettingsService portalSettingsService;
  private final JuheWeatherService juheWeatherService;
  private final TencentWeatherProperties weatherPropertiesTencent;
  private final TencentNewsProperties newsProperties;

  private final Map<String, WeatherCacheSupport.Entry> cacheByAdcode = new LinkedHashMap<>();
  private final Map<String, String> adcodeAliasNames = new ConcurrentHashMap<>();
  private final ConcurrentHashMap<String, Object> adcodeLocks = new ConcurrentHashMap<>();

  public WeatherService(
      @Qualifier("tencentSkillsRestTemplate") RestTemplate restTemplate,
      ObjectMapper objectMapper,
      PortalSettingsService portalSettingsService,
      JuheWeatherService juheWeatherService,
      TencentWeatherProperties weatherPropertiesTencent,
      TencentNewsProperties newsProperties) {
    this.restTemplate = restTemplate;
    this.objectMapper = objectMapper;
    this.portalSettingsService = portalSettingsService;
    this.juheWeatherService = juheWeatherService;
    this.weatherPropertiesTencent = weatherPropertiesTencent;
    this.newsProperties = newsProperties;
  }

  @PostConstruct
  void logUpstreamConfig() {
    if (usesJuhe()) {
      return;
    }
    if (!weatherPropertiesTencent.isEnabled()) {
      log.info("Tencent weather disabled (set TENCENT_WEATHER_ENABLED=true to enable)");
      return;
    }
    if (!NewsJsonSupport.notBlank(resolveTencentApiKey())) {
      log.warn(
          "TENCENT_WEATHER_ENABLED=true but no key: set TENCENT_WEATHER_KEY or TENCENT_NEWS_KEY in api.env");
      return;
    }
    log.info("Tencent weather upstream enabled, baseUrl={}", weatherPropertiesTencent.getBaseUrl());
  }

  public String attribution() {
    if (usesJuhe()) {
      return juheWeatherService.attribution();
    }
    return ATTRIBUTION;
  }

  public List<WeatherRegionDto> regions() {
    return WeatherRegionCatalog.all().stream()
        .map(WeatherRegionDto::from)
        .collect(Collectors.toList());
  }

  public WeatherPayload weatherForAdcode(String adcode) {
    if (usesJuhe()) {
      return juheWeatherService.weatherForAdcode(adcode);
    }
    String resolved =
        WeatherSupport.normalizeAdcode(adcode).orElse(weatherPropertiesTencent.getDefaultAdcode());
    if (!upstreamConfigured()) {
      return defaultUnconfigured();
    }
    return fetchCached(resolved);
  }

  public WeatherPayload weatherByClientIp(String clientIp) {
    if (usesJuhe()) {
      return juheWeatherService.weatherByClientIp(clientIp);
    }
    if (!upstreamConfigured()) {
      return defaultUnconfigured();
    }
    Optional<IpLocation> location = resolveLocationFromIp(clientIp);
    if (location.isEmpty()) {
      return weatherForAdcode(weatherPropertiesTencent.getDefaultAdcode());
    }
    rememberAdcodeName(location.get());
    return weatherForAdcode(location.get().adcode());
  }

  public WeatherPayload weatherNearCoordinates(
      double latitude, double longitude, String clientIp) {
    if (usesJuhe()) {
      return juheWeatherService.weatherNearCoordinates(latitude, longitude, clientIp);
    }
    Optional<WeatherRegion> nearest = WeatherRegionCatalog.nearest(latitude, longitude);
    if (nearest.isPresent()) {
      return weatherForAdcode(nearest.get().getAdcode());
    }
    return weatherByClientIp(clientIp);
  }

  private WeatherPayload defaultUnconfigured() {
    String adcode = weatherPropertiesTencent.getDefaultAdcode();
    String name = resolveCityName(adcode);
    return WeatherPayload.unconfigured(adcode, name);
  }

  private WeatherPayload fetchCached(String adcode) {
    return WeatherCacheSupport.load(
        adcode,
        weatherPropertiesTencent.getRefreshSeconds(),
        WEATHER_CACHE_MAX_SIZE,
        cacheByAdcode,
        adcodeLocks,
        () -> fetchRemote(adcode),
        this::emptyPayload,
        "tencent");
  }

  private WeatherPayload fetchRemote(String adcode) throws Exception {
    CompletableFuture<JsonNode> observeFuture =
        supplyRequiredWeather(adcode, "observe");
    CompletableFuture<JsonNode> forecastFuture =
        supplyRequiredWeather(adcode, "forecast_24h");
    CompletableFuture<JsonNode> hourlyFuture =
        CompletableFuture.supplyAsync(
            () -> postWeatherOrEmpty(adcode, "forecast_1h"), WEATHER_FETCH_EXECUTOR);
    CompletableFuture<JsonNode> indexFuture =
        CompletableFuture.supplyAsync(
            () -> postWeatherOrEmpty(adcode, "index"), WEATHER_FETCH_EXECUTOR);

    try {
      CompletableFuture.allOf(observeFuture, forecastFuture, hourlyFuture, indexFuture)
          .get(WEATHER_FETCH_DEADLINE_SECONDS, TimeUnit.SECONDS);
    } catch (TimeoutException e) {
      throw new IllegalStateException(
          "tencent weather upstream deadline exceeded (" + WEATHER_FETCH_DEADLINE_SECONDS + "s)");
    }

    JsonNode observeRoot = observeFuture.get().path("data").path("observe");
    JsonNode forecastRoot = forecastFuture.get().path("data").path("forecast_24h");
    JsonNode hourlyFull = hourlyFuture.get();
    JsonNode indexRoot = indexFuture.get().path("data").path("index");

    String cityName = resolveCityName(adcode);

    int currentTemp = WeatherSupport.parseIntSafe(NewsJsonSupport.text(observeRoot, "degree"));
    String weatherText = readWeatherText(observeRoot, "weather_short", "weather");
    String humidity = NewsJsonSupport.text(observeRoot, "humidity");
    String windText =
        WeatherSupport.buildWindText(
            NewsJsonSupport.text(observeRoot, "wind_direction_name"),
            NewsJsonSupport.text(observeRoot, "wind_power"));
    String updatedAt = formatUpdateTime(NewsJsonSupport.text(observeRoot, "update_time"));
    List<WeatherForecastDayDto> forecast = parseForecast(forecastRoot);
    List<WeatherHourlyDto> hourly = loadHourly(hourlyFull);
    List<WeatherLifeIndexDto> lifeIndices = parseLifeIndices(indexRoot);

    return new WeatherPayload(
        adcode,
        cityName,
        updatedAt,
        currentTemp,
        weatherText,
        humidity,
        windText,
        WeatherSupport.buildTravelTip(weatherText, forecast),
        forecast,
        hourly,
        lifeIndices,
        true);
  }

  private JsonNode postWeather(String adcode, String weatherType) throws Exception {
    Map<String, Object> body = Map.of("adcode", adcode, "weatherType", weatherType);
    String response = postJson(WEATHER_PATH, body);
    JsonNode root = objectMapper.readTree(response);
    JsonNode baseRsp = root.path("base_rsp");
    if (baseRsp.path("code").asInt(-1) != 0) {
      throw new IllegalStateException(
          "weather " + weatherType + " code=" + baseRsp.path("code").asInt()
              + " msg=" + baseRsp.path("msg").asText(""));
    }
    return root;
  }

  private CompletableFuture<JsonNode> supplyRequiredWeather(String adcode, String weatherType) {
    return CompletableFuture.supplyAsync(
        () -> {
          try {
            return postWeather(adcode, weatherType);
          } catch (Exception e) {
            throw new RuntimeException(e);
          }
        },
        WEATHER_FETCH_EXECUTOR);
  }

  private JsonNode postWeatherOrEmpty(String adcode, String weatherType) {
    try {
      return postWeather(adcode, weatherType);
    } catch (Exception e) {
      log.warn("tencent weather optional type={} adcode={}: {}", weatherType, adcode, e.getMessage());
      return objectMapper.createObjectNode();
    }
  }

  private Optional<IpLocation> resolveLocationFromIp(String clientIp) {
    try {
      Map<String, Object> body = Map.of("ip", clientIp == null ? "" : clientIp.trim());
      String response = postJson(IP2CITY_PATH, body);
      JsonNode root = objectMapper.readTree(response);
      if (root.path("ret").asInt(-1) != 0) {
        return Optional.empty();
      }
      String districtCode = NewsJsonSupport.text(root, "districtCode");
      if (!NewsJsonSupport.notBlank(districtCode)) {
        return Optional.empty();
      }
      String displayName = buildIpDisplayName(root);
      return Optional.of(new IpLocation(districtCode.trim(), displayName));
    } catch (Exception e) {
      log.warn("ip2city failed: {}", e.getMessage());
      return Optional.empty();
    }
  }

  private static String buildIpDisplayName(JsonNode root) {
    String district = NewsJsonSupport.text(root, "district");
    String city = NewsJsonSupport.text(root, "city");
    if (NewsJsonSupport.notBlank(district)) {
      return district;
    }
    if (NewsJsonSupport.notBlank(city)) {
      return city;
    }
    return NewsJsonSupport.text(root, "province");
  }

  private void rememberAdcodeName(IpLocation location) {
    if (location == null || !NewsJsonSupport.notBlank(location.adcode())) {
      return;
    }
    if (!NewsJsonSupport.notBlank(location.displayName())) {
      return;
    }
    adcodeAliasNames.put(location.adcode().trim(), location.displayName().trim());
  }

  private String resolveCityName(String adcode) {
    Optional<String> catalogName = WeatherRegionCatalog.nameForAdcode(adcode);
    if (catalogName.isPresent()) {
      return catalogName.get();
    }
    String alias = adcodeAliasNames.get(adcode);
    if (NewsJsonSupport.notBlank(alias)) {
      return alias.trim();
    }
    return "当前地区";
  }

  private static final class IpLocation {
    private final String adcode;
    private final String displayName;

    IpLocation(String adcode, String displayName) {
      this.adcode = adcode;
      this.displayName = displayName;
    }

    String adcode() {
      return adcode;
    }

    String displayName() {
      return displayName;
    }
  }

  private String postJson(String path, Map<String, Object> body) throws Exception {
    return TencentSkillsHttp.postJson(
        restTemplate,
        objectMapper,
        weatherPropertiesTencent.getBaseUrl(),
        resolveTencentApiKey(),
        weatherPropertiesTencent.getCallerSkill(),
        path,
        body);
  }

  private boolean upstreamConfigured() {
    return weatherPropertiesTencent.isEnabled() && NewsJsonSupport.notBlank(resolveTencentApiKey());
  }

  private boolean usesJuhe() {
    return portalSettingsService.resolveWeatherProviderId() == WeatherProviderId.JUHE;
  }

  private String resolveTencentApiKey() {
    return TencentConfigSupport.resolveSkillsApiKey(weatherPropertiesTencent, newsProperties);
  }

  private static List<WeatherForecastDayDto> parseForecast(JsonNode forecastArray) {
    if (!forecastArray.isArray()) {
      return List.of();
    }
    Map<String, WeatherForecastDayDto> byDate = new LinkedHashMap<>();
    for (JsonNode node : forecastArray) {
      String date = NewsJsonSupport.text(node, "time");
      if (date.isEmpty()) {
        continue;
      }
      if (byDate.containsKey(date)) {
        continue;
      }
      String weatherText = readWeatherText(node, "day_weather_short", "day_weather");
      String nightWeatherText = readWeatherText(node, "night_weather_short", "night_weather");
      String dayWind =
          WeatherSupport.buildWindText(
              NewsJsonSupport.text(node, "day_wind_direction"),
              NewsJsonSupport.text(node, "day_wind_power"));
      String nightWind =
          WeatherSupport.buildWindText(
              NewsJsonSupport.text(node, "night_wind_direction"),
              NewsJsonSupport.text(node, "night_wind_power"));
      String windLabel =
          NewsJsonSupport.firstNonBlank(dayWind, nightWind);
      int hi = WeatherSupport.parseIntSafe(NewsJsonSupport.text(node, "max_degree"));
      int lo = WeatherSupport.parseIntSafe(NewsJsonSupport.text(node, "min_degree"));
      byDate.put(
          date,
          new WeatherForecastDayDto(date, weatherText, nightWeatherText, windLabel, hi, lo));
      if (byDate.size() >= 7) {
        break;
      }
    }
    return List.copyOf(byDate.values());
  }

  private List<WeatherHourlyDto> loadHourly(JsonNode hourlyFull) {
    JsonNode data = hourlyFull.path("data");
    List<WeatherHourlyDto> hourly = parseHourly(data.path("forecast_1h"));
    if (!hourly.isEmpty()) {
      return hourly;
    }
    if (data.has("forecast_1h_data")) {
      hourly = parseHourly(data.path("forecast_1h_data"));
    }
    return hourly.isEmpty() ? List.of() : hourly;
  }

  private static List<WeatherHourlyDto> parseHourly(JsonNode hourlyNode) {
    if (hourlyNode.isArray()) {
      return parseHourlyArray(hourlyNode);
    }
    if (!hourlyNode.isObject()) {
      return List.of();
    }
    List<WeatherHourlyDto> out = new ArrayList<>();
    hourlyNode.fields().forEachRemaining(entry -> appendHourlyNode(out, entry.getValue()));
    return sortAndCapHourly(out);
  }

  private static List<WeatherHourlyDto> parseHourlyArray(JsonNode hourlyArray) {
    List<WeatherHourlyDto> out = new ArrayList<>();
    for (JsonNode node : hourlyArray) {
      appendHourlyNode(out, node);
    }
    return sortAndCapHourly(out);
  }

  private static void appendHourlyNode(List<WeatherHourlyDto> out, JsonNode node) {
    String rawTime = NewsJsonSupport.text(node, "update_time");
    String timeLabel = formatHourLabel(rawTime);
    String weatherText = readWeatherText(node, "weather_short", "weather");
    int temp = WeatherSupport.parseIntSafe(NewsJsonSupport.text(node, "degree"));
    if (!timeLabel.isEmpty() || NewsJsonSupport.notBlank(weatherText) || temp != 0) {
      out.add(new WeatherHourlyDto(timeLabel, weatherText, temp));
    }
  }

  private static List<WeatherHourlyDto> sortAndCapHourly(List<WeatherHourlyDto> out) {
    out.sort(
        (a, b) -> {
          if (a.getTime().equals("现在")) {
            return -1;
          }
          if (b.getTime().equals("现在")) {
            return 1;
          }
          return a.getTime().compareTo(b.getTime());
        });
    Map<String, WeatherHourlyDto> byTime = new LinkedHashMap<>();
    for (WeatherHourlyDto item : out) {
      if (!NewsJsonSupport.notBlank(item.getTime())) {
        continue;
      }
      byTime.putIfAbsent(item.getTime(), item);
    }
    List<WeatherHourlyDto> deduped = new ArrayList<>(byTime.values());
    if (deduped.size() > HOURLY_MAX_ITEMS) {
      return List.copyOf(deduped.subList(0, HOURLY_MAX_ITEMS));
    }
    return List.copyOf(deduped);
  }

  private static String formatHourLabel(String raw) {
    if (!NewsJsonSupport.notBlank(raw)) {
      return "";
    }
    String digits = raw.replaceAll("\\D", "");
    if (digits.length() < 10) {
      return raw.trim();
    }
    try {
      String slice =
          digits.length() >= 12 ? digits.substring(0, 12) : digits.substring(0, 10) + "00";
      LocalDateTime dt =
          LocalDateTime.parse(slice, DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
      LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Shanghai"));
      if (dt.getHour() == now.getHour() && dt.toLocalDate().equals(now.toLocalDate())) {
        return "现在";
      }
      return String.format("%02d:00", dt.getHour());
    } catch (Exception e) {
      return raw.trim();
    }
  }

  private static List<WeatherLifeIndexDto> parseLifeIndices(JsonNode indexRoot) {
    if (!indexRoot.isObject()) {
      return List.of();
    }
    Map<String, WeatherLifeIndexDto> byKey = new LinkedHashMap<>();
    indexRoot
        .fields()
        .forEachRemaining(
            entry -> {
              String key = entry.getKey();
              if (LIFE_INDEX_SKIP_KEYS.contains(key)) {
                return;
              }
              JsonNode node = entry.getValue();
              if (!node.isObject()) {
                return;
              }
              String name = NewsJsonSupport.text(node, "name");
              if (!NewsJsonSupport.notBlank(name)) {
                return;
              }
              String info = NewsJsonSupport.text(node, "info");
              String detail = NewsJsonSupport.text(node, "detail");
              byKey.put(key, new WeatherLifeIndexDto(key, name, info, detail));
            });

    return WeatherSupport.orderLifeIndices(byKey, LIFE_INDEX_ORDER);
  }

  private static String formatUpdateTime(String raw) {
    if (!NewsJsonSupport.notBlank(raw) || raw.length() < 12) {
      return raw == null ? "" : raw;
    }
    try {
      LocalDateTime dt =
          LocalDateTime.parse(
              raw.substring(0, 12), DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
      return dt.atZone(ZoneId.of("Asia/Shanghai"))
          .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    } catch (Exception e) {
      return raw;
    }
  }

  private static String readWeatherText(JsonNode node, String shortKey, String fullKey) {
    return NewsJsonSupport.firstNonBlank(
        NewsJsonSupport.text(node, shortKey),
        NewsJsonSupport.text(node, fullKey));
  }

  private WeatherPayload emptyPayload(String adcode) {
    return new WeatherPayload(
        adcode,
        resolveCityName(adcode),
        "",
        0,
        "",
        "",
        "",
        "",
        List.of(),
        List.of(),
        List.of(),
        upstreamConfigured());
  }
}
