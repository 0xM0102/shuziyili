package com.shuziyili.module.weather;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shuziyili.config.TencentNewsProperties;
import com.shuziyili.config.TencentWeatherProperties;
import com.shuziyili.module.news.NewsJsonSupport;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
  private static final int TRAVEL_TIP_FORECAST_DAYS = 2;

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
  private final TencentWeatherProperties weatherProperties;
  private final TencentNewsProperties newsProperties;

  private final Object lock = new Object();
  private final Map<String, CachedWeather> cacheByAdcode = new LinkedHashMap<>();
  private final Map<String, String> adcodeAliasNames = new ConcurrentHashMap<>();

  public WeatherService(
      RestTemplate restTemplate,
      ObjectMapper objectMapper,
      TencentWeatherProperties weatherProperties,
      TencentNewsProperties newsProperties) {
    this.restTemplate = restTemplate;
    this.objectMapper = objectMapper;
    this.weatherProperties = weatherProperties;
    this.newsProperties = newsProperties;
  }

  public String attribution() {
    return ATTRIBUTION;
  }

  public List<WeatherRegionDto> regions() {
    return WeatherRegionCatalog.all().stream()
        .map(WeatherRegionDto::from)
        .collect(Collectors.toList());
  }

  public WeatherPayload weatherForAdcode(String adcode) {
    String resolved = normalizeAdcode(adcode).orElse(weatherProperties.getDefaultAdcode());
    if (!upstreamConfigured()) {
      return defaultUnconfigured();
    }
    synchronized (lock) {
      return fetchCached(resolved);
    }
  }

  public WeatherPayload weatherByClientIp(String clientIp) {
    if (!upstreamConfigured()) {
      return defaultUnconfigured();
    }
    Optional<IpLocation> location = resolveLocationFromIp(clientIp);
    if (location.isEmpty()) {
      return weatherForAdcode(weatherProperties.getDefaultAdcode());
    }
    rememberAdcodeName(location.get());
    return weatherForAdcode(location.get().adcode());
  }

  public WeatherPayload weatherNearCoordinates(
      double latitude, double longitude, String clientIp) {
    Optional<WeatherRegion> nearest = WeatherRegionCatalog.nearest(latitude, longitude);
    if (nearest.isPresent()) {
      return weatherForAdcode(nearest.get().getAdcode());
    }
    return weatherByClientIp(clientIp);
  }

  private WeatherPayload defaultUnconfigured() {
    String adcode = weatherProperties.getDefaultAdcode();
    String name = resolveCityName(adcode);
    return WeatherPayload.unconfigured(adcode, name);
  }

  private WeatherPayload fetchCached(String adcode) {
    Instant now = Instant.now();
    CachedWeather cached = cacheByAdcode.get(adcode);
    if (cached != null
        && !NewsJsonSupport.refreshCooldownElapsed(
            cached.fetchedAt, now, weatherProperties.getRefreshSeconds())) {
      return cached.payload;
    }
    try {
      WeatherPayload payload = fetchRemote(adcode);
      putCachedWeather(adcode, new CachedWeather(payload, now));
      return payload;
    } catch (Exception e) {
      log.warn("tencent weather fetch failed adcode={}: {}", adcode, e.getMessage());
      if (cached != null) {
        return cached.payload;
      }
      return emptyPayload(adcode);
    }
  }

  private void putCachedWeather(String adcode, CachedWeather cached) {
    cacheByAdcode.put(adcode, cached);
    while (cacheByAdcode.size() > WEATHER_CACHE_MAX_SIZE) {
      String eldest = cacheByAdcode.keySet().iterator().next();
      cacheByAdcode.remove(eldest);
    }
  }

  private WeatherPayload fetchRemote(String adcode) throws Exception {
    JsonNode observeRoot =
        postWeather(adcode, "observe").path("data").path("observe");
    JsonNode forecastRoot =
        postWeather(adcode, "forecast_24h").path("data").path("forecast_24h");
    JsonNode hourlyRoot = safeWeatherData(adcode, "forecast_1h", "forecast_1h");
    JsonNode indexRoot = safeWeatherData(adcode, "index", "index");

    String cityName = resolveCityName(adcode);

    int currentTemp = parseIntSafe(NewsJsonSupport.text(observeRoot, "degree"));
    String weatherText = readWeatherText(observeRoot, "weather_short", "weather");
    String humidity = NewsJsonSupport.text(observeRoot, "humidity");
    String windText =
        buildWindText(
            NewsJsonSupport.text(observeRoot, "wind_direction_name"),
            NewsJsonSupport.text(observeRoot, "wind_power"));
    String updatedAt = formatUpdateTime(NewsJsonSupport.text(observeRoot, "update_time"));
    List<WeatherForecastDayDto> forecast = parseForecast(forecastRoot);
    List<WeatherHourlyDto> hourly = loadHourly(adcode, hourlyRoot);
    List<WeatherLifeIndexDto> lifeIndices = parseLifeIndices(indexRoot);

    return new WeatherPayload(
        adcode,
        cityName,
        updatedAt,
        currentTemp,
        weatherText,
        humidity,
        windText,
        buildTravelTip(weatherText, forecast),
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

  private JsonNode safeWeatherData(String adcode, String weatherType, String dataKey) {
    try {
      return postWeather(adcode, weatherType).path("data").path(dataKey);
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
    String base = weatherProperties.getBaseUrl().trim();
    if (base.endsWith("/")) {
      base = base.substring(0, base.length() - 1);
    }
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setBearerAuth(resolveApiKey());
    if (NewsJsonSupport.notBlank(weatherProperties.getCallerSkill())) {
      headers.set("Caller-Skill", weatherProperties.getCallerSkill().trim());
    }
    String json = objectMapper.writeValueAsString(body);
    HttpEntity<String> entity = new HttpEntity<>(json, headers);
    return restTemplate.postForObject(base + path, entity, String.class);
  }

  private boolean upstreamConfigured() {
    return weatherProperties.isEnabled() && NewsJsonSupport.notBlank(resolveApiKey());
  }

  private String resolveApiKey() {
    if (NewsJsonSupport.notBlank(weatherProperties.getKey())) {
      return weatherProperties.getKey().trim();
    }
    if (newsProperties.isEnabled() && NewsJsonSupport.notBlank(newsProperties.getKey())) {
      return newsProperties.getKey().trim();
    }
    return "";
  }

  private static Optional<String> normalizeAdcode(String adcode) {
    if (!NewsJsonSupport.notBlank(adcode)) {
      return Optional.empty();
    }
    String trimmed = adcode.trim();
    if (!trimmed.matches("\\d{6}")) {
      return Optional.empty();
    }
    return Optional.of(trimmed);
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
          buildWindText(
              NewsJsonSupport.text(node, "day_wind_direction"),
              NewsJsonSupport.text(node, "day_wind_power"));
      String nightWind =
          buildWindText(
              NewsJsonSupport.text(node, "night_wind_direction"),
              NewsJsonSupport.text(node, "night_wind_power"));
      String windLabel =
          NewsJsonSupport.firstNonBlank(dayWind, nightWind);
      int hi = parseIntSafe(NewsJsonSupport.text(node, "max_degree"));
      int lo = parseIntSafe(NewsJsonSupport.text(node, "min_degree"));
      byDate.put(
          date,
          new WeatherForecastDayDto(date, weatherText, nightWeatherText, windLabel, hi, lo));
      if (byDate.size() >= 7) {
        break;
      }
    }
    return List.copyOf(byDate.values());
  }

  private List<WeatherHourlyDto> loadHourly(String adcode, JsonNode hourlyRoot) {
    List<WeatherHourlyDto> hourly = parseHourly(hourlyRoot);
    if (!hourly.isEmpty()) {
      return hourly;
    }
    try {
      JsonNode root = postWeather(adcode, "forecast_1h");
      JsonNode data = root.path("data");
      for (String key : List.of("forecast_1h", "forecast_1h_data")) {
        if (!data.has(key)) {
          continue;
        }
        hourly = parseHourly(data.path(key));
        if (!hourly.isEmpty()) {
          return hourly;
        }
      }
    } catch (Exception e) {
      log.debug("hourly extended parse failed adcode={}: {}", adcode, e.getMessage());
    }
    return List.of();
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
    int temp = parseIntSafe(NewsJsonSupport.text(node, "degree"));
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

    List<WeatherLifeIndexDto> out = new ArrayList<>();
    for (String key : LIFE_INDEX_ORDER) {
      WeatherLifeIndexDto item = byKey.get(key);
      if (item != null) {
        out.add(item);
      }
    }
    for (Map.Entry<String, WeatherLifeIndexDto> entry : byKey.entrySet()) {
      if (!LIFE_INDEX_ORDER.contains(entry.getKey())) {
        out.add(entry.getValue());
      }
    }
    return List.copyOf(out);
  }

  private static String buildWindText(String direction, String power) {
    if (!NewsJsonSupport.notBlank(direction) && !NewsJsonSupport.notBlank(power)) {
      return "";
    }
    if (!NewsJsonSupport.notBlank(power)) {
      return direction;
    }
    if (!NewsJsonSupport.notBlank(direction)) {
      return power + " 级";
    }
    return direction + " " + power + " 级";
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

  private static int parseIntSafe(String value) {
    if (!NewsJsonSupport.notBlank(value)) {
      return 0;
    }
    try {
      return Integer.parseInt(value.trim());
    } catch (NumberFormatException e) {
      return 0;
    }
  }

  private static String buildTravelTip(String currentWeather, List<WeatherForecastDayDto> forecast) {
    String combined = currentWeather;
    List<WeatherForecastDayDto> nearForecast = nearForecastDays(forecast);
    for (WeatherForecastDayDto day : nearForecast) {
      combined += day.getWeatherText();
      combined += day.getNightWeatherText();
    }
    if (combined.contains("雨") || combined.contains("雪")) {
      return "可能有降水，备雨具与防滑鞋";
    }
    if (nearForecast.stream().anyMatch(d -> d.getHi() - d.getLo() >= 12)) {
      return "早晚温差大，备外套";
    }
    if (combined.contains("晴")) {
      return "紫外线较强，注意防晒";
    }
    return "关注天气变化，适时增减衣物";
  }

  private static List<WeatherForecastDayDto> nearForecastDays(List<WeatherForecastDayDto> forecast) {
    LocalDate today = LocalDate.now(ZoneId.of("Asia/Shanghai"));
    LocalDate latest = today.plusDays(TRAVEL_TIP_FORECAST_DAYS - 1L);
    List<WeatherForecastDayDto> near = new ArrayList<>();
    for (WeatherForecastDayDto day : forecast) {
      try {
        LocalDate date = LocalDate.parse(day.getDate());
        if ((date.isEqual(today) || date.isAfter(today))
            && (date.isEqual(latest) || date.isBefore(latest))) {
          near.add(day);
        }
      } catch (Exception ignored) {
        // 上游日期异常时不让提示逻辑失败，后面会回退到原列表前两项。
      }
    }
    if (!near.isEmpty()) {
      return near;
    }
    return forecast.size() > TRAVEL_TIP_FORECAST_DAYS
        ? forecast.subList(0, TRAVEL_TIP_FORECAST_DAYS)
        : forecast;
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

  private static final class CachedWeather {
    final WeatherPayload payload;
    final Instant fetchedAt;

    CachedWeather(WeatherPayload payload, Instant fetchedAt) {
      this.payload = payload;
      this.fetchedAt = fetchedAt;
    }
  }
}
