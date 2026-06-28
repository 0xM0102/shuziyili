package com.shuziyili.module.weather;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.common.ClientIpSupport;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/weather")
public class PublicWeatherController {

  private final WeatherService weatherService;

  public PublicWeatherController(WeatherService weatherService) {
    this.weatherService = weatherService;
  }

  /** 可选地区列表（全国常用城市，伊犁优先），供前端切换。 */
  @GetMapping("/regions")
  public ResponseEntity<ApiResponse<List<WeatherRegionDto>>> regions() {
    return ResponseEntity.ok(ApiResponse.success(weatherService.regions()));
  }

  /** 按 adcode 查询；未传时使用配置默认地区。 */
  @GetMapping
  public ResponseEntity<ApiResponse<WeatherPayload>> weather(
      @RequestParam(value = "adcode", required = false) String adcode) {
    return ResponseEntity.ok(ApiResponse.success(weatherService.weatherForAdcode(adcode)));
  }

  /** 按请求 IP 解析所在城市并返回天气（用于「定位」）。 */
  @GetMapping("/location")
  public ResponseEntity<ApiResponse<WeatherPayload>> weatherByLocation(HttpServletRequest request) {
    String ip = ClientIpSupport.resolveClientIp(request);
    return ResponseEntity.ok(ApiResponse.success(weatherService.weatherByClientIp(ip)));
  }

  /** 按经纬度匹配目录内最近城市；偏差过大时回退为 IP 定位。 */
  @GetMapping("/nearby")
  public ResponseEntity<ApiResponse<WeatherPayload>> weatherNearby(
      @RequestParam("lat") double latitude,
      @RequestParam("lng") double longitude,
      HttpServletRequest request) {
    String ip = ClientIpSupport.resolveClientIp(request);
    return ResponseEntity.ok(
        ApiResponse.success(weatherService.weatherNearCoordinates(latitude, longitude, ip)));
  }

  @GetMapping("/meta")
  public ResponseEntity<ApiResponse<Map<String, String>>> meta() {
    Map<String, String> meta = new LinkedHashMap<>(1);
    meta.put("attribution", weatherService.attribution());
    return ResponseEntity.ok(ApiResponse.success(meta));
  }
}
