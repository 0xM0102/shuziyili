package com.shuziyili.module.home;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.module.auth.StaffAuthService;
import com.shuziyili.module.auth.StaffPermissionCodes;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 管理后台：首页精选（独立于文章「类型」字段）。 */
@RestController
@RequestMapping("/api/v1/admin/home-articles")
public class AdminHomeArticleController {

  private final StaffAuthService staffAuthService;
  private final HomeCurationService homeCurationService;

  public AdminHomeArticleController(
      StaffAuthService staffAuthService, HomeCurationService homeCurationService) {
    this.staffAuthService = staffAuthService;
    this.homeCurationService = homeCurationService;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.ARTICLES_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    List<HomeCurationService.AdminSlotRow> rows = homeCurationService.listAdminFeaturedSlots();
    List<Map<String, Object>> items = new ArrayList<>(rows.size());
    for (HomeCurationService.AdminSlotRow r : rows) {
      items.add(r.toAdminItemMap());
    }
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }

  @PutMapping
  public ResponseEntity<ApiResponse<Void>> replace(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody(required = false) HomeArticlesReplaceBody body) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.ARTICLES_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    try {
      homeCurationService.replaceFeatured(body == null ? null : body.articleIds);
    } catch (IllegalArgumentException e) {
      if ("article_not_found".equals(e.getMessage())) {
        return ResponseEntity.ok(ApiResponse.fail("article_not_found"));
      }
      throw e;
    }
    return ResponseEntity.ok(ApiResponse.success());
  }
}
