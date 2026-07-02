package com.shuziyili.module.weather;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shuziyili.config.JuheConfigSupport;
import com.shuziyili.config.JuheNewsProperties;
import com.shuziyili.config.JuheWeatherProperties;
import com.shuziyili.module.news.NewsJsonSupport;
import java.net.URI;
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * 聚合数据「天气预报」（文档 ID 73）：按城市名查询实况与未来 5 天预报，生活指数走独立接口。
 *
 * @see <a href="https://www.juhe.cn/docs/api/id/73">Juhe 天气预报</a>
 */
@Service
public class JuheWeatherService {

  private static final Logger log = LoggerFactory.getLogger(JuheWeatherService.class);

  static final String ATTRIBUTION =
      "天气数据来自聚合数据「天气预报」接口（https://www.juhe.cn/docs/api/id/73）。";

  private static final Pattern TEMP_RANGE = Pattern.compile("(\\d+)\\s*/\\s*(\\d+)");

  private static final List<String> LIFE_INDEX_ORDER =
      List.of(
          "clothes",
          "umbrella",
          "cold",
          "carwash",
          "sports",
          "ultraviolet",
          "comfort",
          "fish",
          "allergy",
          "airconditioner");

  private static final Map<String, String> JUHE_LIFE_KEY_TO_CANONICAL =
      Map.ofEntries(
          Map.entry("chuanyi", "clothes"),
          Map.entry("daisan", "umbrella"),
          Map.entry("ganmao", "cold"),
          Map.entry("xiche", "carwash"),
          Map.entry("yundong", "sports"),
          Map.entry("ziwaixian", "ultraviolet"),
          Map.entry("shushidu", "comfort"),
          Map.entry("diaoyu", "fish"),
          Map.entry("guomin", "allergy"),
          Map.entry("kongtiao", "airconditioner"));

  private static final Map<String, String> LIFE_INDEX_NAMES =
      Map.ofEntries(
          Map.entry("clothes", "穿衣"),
          Map.entry("umbrella", "带伞"),
          Map.entry("cold", "感冒"),
          Map.entry("carwash", "洗车"),
          Map.entry("sports", "运动"),
          Map.entry("ultraviolet", "紫外线"),
          Map.entry("comfort", "舒适度"),
          Map.entry("fish", "钓鱼"),
          Map.entry("allergy", "过敏"),
          Map.entry("airconditioner", "空调"));

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;
  private final JuheWeatherProperties properties;
  private final JuheNewsProperties newsProperties;

  private final Map<String, WeatherCacheSupport.Entry> cacheByAdcode = new LinkedHashMap<>();
  private final Map<String, Object> adcodeLocks = new LinkedHashMap<>();

  public JuheWeatherService(
      RestTemplate restTemplate,
      ObjectMapper objectMapper,
      JuheWeatherProperties properties,
      JuheNewsProperties newsProperties) {
    this.restTemplate = restTemplate;
    this.objectMapper = objectMapper;
    this.properties = properties;
    this.newsProperties = newsProperties;
  }

  @PostConstruct
  void logUpstreamConfig() {
    if (!isConfigured()) {
      log.info(
          "Juhe weather disabled (set JUHE_WEATHER_ENABLED=true and JUHE_WEATHER_KEY or JUHE_NEWS_KEY)");
      return;
    }
    log.info("Juhe weather upstream enabled, queryUrl={}", properties.getQueryUrl());
  }

  public boolean isConfigured() {
    return properties.isEnabled() && NewsJsonSupport.notBlank(resolveApiKey());
  }

  private String resolveApiKey() {
    return JuheConfigSupport.resolveWeatherApiKey(properties, newsProperties);
  }

  public String attribution() {
    return ATTRIBUTION;
  }

  public WeatherPayload weatherForAdcode(String adcode) {
    String resolved =
        WeatherSupport.normalizeAdcode(adcode).orElse(properties.getDefaultAdcode());
    if (!isConfigured()) {
      return unconfigured(resolved);
    }
    return fetchCached(resolved);
  }

  public WeatherPayload weatherByClientIp(String clientIp) {
    if (!isConfigured()) {
      return unconfigured(properties.getDefaultAdcode());
    }
    // 聚合简单天气无 IP 定位，回退默认城市。
    return weatherForAdcode(properties.getDefaultAdcode());
  }

  public WeatherPayload weatherNearCoordinates(double latitude, double longitude, String clientIp) {
    Optional<WeatherRegion> nearest = WeatherRegionCatalog.nearest(latitude, longitude);
    if (nearest.isPresent()) {
      return weatherForAdcode(nearest.get().getAdcode());
    }
    return weatherByClientIp(clientIp);
  }

  private WeatherPayload fetchCached(String adcode) {
    return WeatherCacheSupport.load(
        adcode,
        properties.getRefreshSeconds(),
        256,
        cacheByAdcode,
        adcodeLocks,
        () -> fetchRemote(adcode),
        this::emptyPayload,
        "juhe");
  }

  private WeatherPayload fetchRemote(String adcode) throws Exception {
    String cityQuery = resolveCityQuery(adcode);
    JsonNode queryRoot = fetchJson(queryUrl(properties.getQueryUrl(), cityQuery));
    if (queryRoot.path("error_code").asInt(-1) != 0) {
      throw new IllegalStateException(
          "juhe weather query error_code="
              + queryRoot.path("error_code").asInt()
              + " reason="
              + queryRoot.path("reason").asText(""));
    }
    JsonNode result = queryRoot.path("result");
    JsonNode realtime = result.path("realtime");
    String cityName =
        NewsJsonSupport.firstNonBlank(
            NewsJsonSupport.text(result, "city"), WeatherRegionCatalog.nameForAdcode(adcode).orElse(""));

    int currentTemp = WeatherSupport.parseIntSafe(NewsJsonSupport.text(realtime, "temperature"));
    String weatherText = NewsJsonSupport.text(realtime, "info");
    String humidity = NewsJsonSupport.text(realtime, "humidity");
    String windText =
        WeatherSupport.buildWindText(
            NewsJsonSupport.text(realtime, "direct"), NewsJsonSupport.text(realtime, "power"));
    List<WeatherForecastDayDto> forecast = parseFuture(result.path("future"));
    List<WeatherLifeIndexDto> lifeIndices = fetchLifeIndices(cityQuery);

    String updatedAt =
        LocalDateTime.now(ZoneId.of("Asia/Shanghai"))
            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

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
        List.of(),
        lifeIndices,
        true);
  }

  private List<WeatherLifeIndexDto> fetchLifeIndices(String cityQuery) {
    try {
      JsonNode lifeRoot = fetchJson(queryUrl(properties.getLifeUrl(), cityQuery));
      if (lifeRoot.path("error_code").asInt(-1) != 0) {
        return List.of();
      }
      return parseLifeIndices(lifeRoot.path("result").path("life"));
    } catch (Exception e) {
      log.warn("juhe weather life fetch failed city={}: {}", cityQuery, e.getMessage());
      return List.of();
    }
  }

  private URI queryUrl(String baseUrl, String city) {
    return UriComponentsBuilder.fromHttpUrl(baseUrl.trim())
        .queryParam("key", resolveApiKey())
        .queryParam("city", city)
        .build()
        .encode()
        .toUri();
  }

  private JsonNode fetchJson(URI uri) throws Exception {
    String body = restTemplate.getForObject(uri, String.class);
    if (body == null || body.isBlank()) {
      throw new IllegalStateException("empty juhe weather response");
    }
    return objectMapper.readTree(body);
  }

  private static List<WeatherForecastDayDto> parseFuture(JsonNode futureNode) {
    if (!futureNode.isArray()) {
      return List.of();
    }
    List<WeatherForecastDayDto> out = new ArrayList<>();
    for (JsonNode node : futureNode) {
      String date = NewsJsonSupport.text(node, "date");
      if (date.isEmpty()) {
        continue;
      }
      String weather = NewsJsonSupport.text(node, "weather");
      String dayText = weather;
      String nightText = "";
      int split = weather.indexOf('转');
      if (split >= 0) {
        dayText = weather.substring(0, split).trim();
        nightText = weather.substring(split + 1).trim();
      }
      int lo = 0;
      int hi = 0;
      Matcher matcher = TEMP_RANGE.matcher(NewsJsonSupport.text(node, "temperature"));
      if (matcher.find()) {
        lo = WeatherSupport.parseIntSafe(matcher.group(1));
        hi = WeatherSupport.parseIntSafe(matcher.group(2));
      }
      out.add(
          new WeatherForecastDayDto(
              date, dayText, nightText, NewsJsonSupport.text(node, "direct"), hi, lo));
      if (out.size() >= 7) {
        break;
      }
    }
    return List.copyOf(out);
  }

  private static List<WeatherLifeIndexDto> parseLifeIndices(JsonNode lifeRoot) {
    if (!lifeRoot.isObject()) {
      return List.of();
    }
    Map<String, WeatherLifeIndexDto> byKey = new LinkedHashMap<>();
    lifeRoot
        .fields()
        .forEachRemaining(
            entry -> {
              String canonical = JUHE_LIFE_KEY_TO_CANONICAL.get(entry.getKey());
              if (canonical == null) {
                return;
              }
              JsonNode node = entry.getValue();
              if (!node.isObject()) {
                return;
              }
              String info = NewsJsonSupport.text(node, "v");
              String detail = NewsJsonSupport.text(node, "des");
              byKey.put(
                  canonical,
                  new WeatherLifeIndexDto(
                      canonical, LIFE_INDEX_NAMES.getOrDefault(canonical, canonical), info, detail));
            });

    return WeatherSupport.orderLifeIndices(byKey, LIFE_INDEX_ORDER);
  }

  private static String resolveCityQuery(String adcode) {
    return WeatherRegionCatalog.nameForAdcode(adcode).orElse("伊宁市");
  }

  private WeatherPayload unconfigured(String adcode) {
    String name = WeatherRegionCatalog.nameForAdcode(adcode).orElse("当前地区");
    return WeatherPayload.unconfigured(adcode, name);
  }

  private WeatherPayload emptyPayload(String adcode) {
    return new WeatherPayload(
        adcode,
        resolveCityQuery(adcode),
        "",
        0,
        "",
        "",
        "",
        "",
        List.of(),
        List.of(),
        List.of(),
        isConfigured());
  }
}
