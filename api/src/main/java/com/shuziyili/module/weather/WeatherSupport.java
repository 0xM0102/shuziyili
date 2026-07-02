package com.shuziyili.module.weather;

import com.shuziyili.module.news.NewsJsonSupport;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

/** 腾讯 / 聚合天气适配器共用的文案与 adcode 工具。 */
final class WeatherSupport {

  private static final ZoneId SHANGHAI = ZoneId.of("Asia/Shanghai");
  private static final int TRAVEL_TIP_FORECAST_DAYS = 2;

  private WeatherSupport() {}

  static Optional<String> normalizeAdcode(String adcode) {
    if (!NewsJsonSupport.notBlank(adcode)) {
      return Optional.empty();
    }
    String trimmed = adcode.trim();
    if (!trimmed.matches("\\d{6}")) {
      return Optional.empty();
    }
    return Optional.of(trimmed);
  }

  static String buildWindText(String direction, String power) {
    if (!NewsJsonSupport.notBlank(direction) && !NewsJsonSupport.notBlank(power)) {
      return "";
    }
    if (!NewsJsonSupport.notBlank(power)) {
      return direction;
    }
    String powerLabel = power.trim().endsWith("级") ? power.trim() : power.trim() + "级";
    if (!NewsJsonSupport.notBlank(direction)) {
      return powerLabel;
    }
    return direction.trim() + " " + powerLabel;
  }

  static int parseIntSafe(String value) {
    if (!NewsJsonSupport.notBlank(value)) {
      return 0;
    }
    try {
      return Integer.parseInt(value.trim());
    } catch (NumberFormatException e) {
      return 0;
    }
  }

  /** 根据实况与近几预报生成出行提示（中英天气描述关键词启发式）。 */
  static String buildTravelTip(String currentWeather, List<WeatherForecastDayDto> forecast) {
    List<WeatherForecastDayDto> near = nearForecastDays(forecast);
    StringBuilder combined = new StringBuilder(currentWeather == null ? "" : currentWeather);
    for (WeatherForecastDayDto day : near) {
      combined.append(day.getWeatherText()).append(day.getNightWeatherText());
    }
    String text = combined.toString();
    if (text.contains("雨") || text.contains("雪")) {
      return "可能有降水，备雨具与防滑鞋";
    }
    if (near.stream().anyMatch(d -> d.getHi() - d.getLo() >= 12)) {
      return "早晚温差大，备外套";
    }
    if (text.contains("晴")) {
      return "紫外线较强，注意防晒";
    }
    return "关注天气变化，适时增减衣物";
  }

  /** 按既定顺序输出生活指数，未列出的 key 追加在末尾。 */
  static List<WeatherLifeIndexDto> orderLifeIndices(
      Map<String, WeatherLifeIndexDto> byKey, List<String> order) {
    List<WeatherLifeIndexDto> out = new ArrayList<>();
    Set<String> ordered = new HashSet<>(order);
    for (String key : order) {
      WeatherLifeIndexDto item = byKey.get(key);
      if (item != null) {
        out.add(item);
      }
    }
    for (Map.Entry<String, WeatherLifeIndexDto> entry : byKey.entrySet()) {
      if (!ordered.contains(entry.getKey())) {
        out.add(entry.getValue());
      }
    }
    return List.copyOf(out);
  }

  private static List<WeatherForecastDayDto> nearForecastDays(List<WeatherForecastDayDto> forecast) {
    LocalDate today = LocalDate.now(SHANGHAI);
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
        // 上游日期异常时跳过。
      }
    }
    if (!near.isEmpty()) {
      return near;
    }
    return forecast.size() > TRAVEL_TIP_FORECAST_DAYS
        ? forecast.subList(0, TRAVEL_TIP_FORECAST_DAYS)
        : forecast;
  }
}
