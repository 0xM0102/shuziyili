package com.shuziyili.module.home;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.common.BearerTokens;
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
    if (!hasArticlesManage(authorization)) {
      return ResponseEntity.ok(ApiResponse.fail("forbidden"));
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
      @RequestBody(required = false) ReplaceReq req) {
    if (!hasArticlesManage(authorization)) {
      return ResponseEntity.ok(ApiResponse.fail("forbidden"));
    }
    try {
      homeCurationService.replaceFeatured(req == null ? null : req.articleIds);
    } catch (IllegalArgumentException e) {
      if ("article_not_found".equals(e.getMessage())) {
        return ResponseEntity.ok(ApiResponse.fail("article_not_found"));
      }
      throw e;
    }
    return ResponseEntity.ok(ApiResponse.success());
  }

  private boolean hasArticlesManage(String authorization) {
    String token = BearerTokens.extract(authorization);
    return staffAuthService.requireStaffPermission(token, StaffPermissionCodes.ARTICLES_MANAGE).isOk();
  }

  public static class ReplaceReq {
    public List<String> articleIds;
  }
}
