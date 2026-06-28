package com.shuziyili.module.weather;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/** 全国常用城市 adcode 目录（伊犁优先），用于切换与 GPS 就近匹配。 */
public final class WeatherRegionCatalog {

  private static final List<WeatherRegion> REGIONS = loadRegions();
  private static final double NEAREST_MAX_SQUARED_DEGREES = 4.0;

  private WeatherRegionCatalog() {}

  public static List<WeatherRegion> all() {
    return REGIONS;
  }

  public static Optional<WeatherRegion> findByAdcode(String adcode) {
    if (adcode == null || adcode.isBlank()) {
      return Optional.empty();
    }
    String normalized = adcode.trim();
    for (WeatherRegion region : REGIONS) {
      if (region.getAdcode().equals(normalized)) {
        return Optional.of(region);
      }
    }
    return Optional.empty();
  }

  public static Optional<String> nameForAdcode(String adcode) {
    return findByAdcode(adcode).map(WeatherRegion::getName);
  }

  /**
   * 按经纬度匹配目录内最近城市；若偏差过大（约 &gt; 200km）则视为无匹配。
   */
  public static List<WeatherRegion> featured() {
    List<WeatherRegion> out = new ArrayList<>();
    for (WeatherRegion region : REGIONS) {
      if (region.isFeatured()) {
        out.add(region);
      }
    }
    return out;
  }

  public static Optional<WeatherRegion> nearest(double latitude, double longitude) {
    WeatherRegion best = null;
    double bestDist = Double.MAX_VALUE;
    for (WeatherRegion region : REGIONS) {
      if (region.getLatitude() == 0 && region.getLongitude() == 0) {
        continue;
      }
      double dLat = region.getLatitude() - latitude;
      double dLng = region.getLongitude() - longitude;
      double dist = dLat * dLat + dLng * dLng;
      if (dist < bestDist) {
        bestDist = dist;
        best = region;
      }
    }
    if (best == null || bestDist > NEAREST_MAX_SQUARED_DEGREES) {
      return Optional.empty();
    }
    return Optional.of(best);
  }

  private static List<WeatherRegion> loadRegions() {
    ObjectMapper mapper = new ObjectMapper();
    try (InputStream in =
        WeatherRegionCatalog.class.getResourceAsStream("/weather/region-catalog.json")) {
      if (in == null) {
        return List.of();
      }
      JsonNode root = mapper.readTree(in);
      if (!root.isArray()) {
        return List.of();
      }
      List<WeatherRegion> out = new ArrayList<>();
      for (JsonNode node : root) {
        String adcode = node.path("adcode").asText("");
        String name = node.path("name").asText("");
        String province = node.path("province").asText("");
        double lat = node.path("lat").asDouble(0);
        double lng = node.path("lng").asDouble(0);
        boolean featured = node.path("featured").asBoolean(false);
        if (adcode.matches("\\d{6}") && !name.isBlank()) {
          out.add(new WeatherRegion(adcode, name, province, lat, lng, featured));
        }
      }
      return List.copyOf(out);
    } catch (Exception e) {
      return List.of();
    }
  }
}
