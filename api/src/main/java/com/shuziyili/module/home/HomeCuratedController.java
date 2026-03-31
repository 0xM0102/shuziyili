package com.shuziyili.module.home;

import com.shuziyili.common.ApiResponse;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 门户首页：精选（文章 ID 由 {@link AdminHomeArticleController} 配置）。 */
@RestController
@RequestMapping("/api/v1/home")
public class HomeCuratedController {

  private final HomeCurationService homeCurationService;

  public HomeCuratedController(HomeCurationService homeCurationService) {
    this.homeCurationService = homeCurationService;
  }

  @GetMapping("/curated")
  public ResponseEntity<ApiResponse<Map<String, Object>>> curated() {
    return ResponseEntity.ok(ApiResponse.success(homeCurationService.publicCurated()));
  }
}
