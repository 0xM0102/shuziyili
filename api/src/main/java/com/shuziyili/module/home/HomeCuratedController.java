package com.shuziyili.module.home;

import com.shuziyili.common.ApiResponse;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 门户首页：精选（文章 ID 由 {@link AdminHomeArticleController} 配置）、天聚地区资讯块。 */
@RestController
@RequestMapping("/api/v1/home")
public class HomeCuratedController {

  private final HomeCurationService homeCurationService;
  private final HomeAreaNewsService homeAreaNewsService;

  public HomeCuratedController(
      HomeCurationService homeCurationService, HomeAreaNewsService homeAreaNewsService) {
    this.homeCurationService = homeCurationService;
    this.homeAreaNewsService = homeAreaNewsService;
  }

  @GetMapping("/curated")
  public ResponseEntity<ApiResponse<Map<String, Object>>> curated() {
    return ResponseEntity.ok(ApiResponse.success(homeCurationService.publicCurated()));
  }

  /** 首页地区资讯（天聚数行 {@code areaname}，默认新疆）；须 {@code TIANAPI_NEWS_ENABLED=true}。 */
  @GetMapping("/area-news")
  public ResponseEntity<ApiResponse<Map<String, Object>>> areaNews() {
    return ResponseEntity.ok(ApiResponse.success(homeAreaNewsService.publicAreaNews()));
  }
}
