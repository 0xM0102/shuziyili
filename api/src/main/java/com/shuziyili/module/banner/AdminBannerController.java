package com.shuziyili.module.banner;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.module.auth.StaffPermissionCodes;
import com.shuziyili.module.auth.StaffAuthService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 后台 CRUD：全站 banners 表，按 scope 分板块；列表参数 scope 默认 home。 */
@RestController
@RequestMapping("/api/v1/admin/banners")
public class AdminBannerController {

  private final AdminBannerService bannerService;
  private final StaffAuthService staffAuthService;

  public AdminBannerController(AdminBannerService bannerService, StaffAuthService staffAuthService) {
    this.bannerService = bannerService;
    this.staffAuthService = staffAuthService;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestParam(value = "scope", required = false) String scope) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.BANNERS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    List<AdminBannerService.Banner> items = bannerService.list(scope);
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AdminBannerService.Banner>> create(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody UpsertReq req) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.BANNERS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    if (req == null || req.imageUrl == null || req.imageUrl.trim().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("empty_image"));
    }
    AdminBannerService.UpdateResult r = bannerService.create(req);
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.banner));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<AdminBannerService.Banner>> update(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") Long id,
      @RequestBody UpsertReq req) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.BANNERS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    AdminBannerService.UpdateResult r = bannerService.update(id, req);
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.banner));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> delete(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") Long id) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.BANNERS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    boolean ok = bannerService.delete(id);
    return ResponseEntity.ok(ok ? ApiResponse.success() : ApiResponse.fail("not_found"));
  }

  public static class UpsertReq {
    /** 板块：home、travel；新建时可选，默认 home */
    public String scope;
    public String title;
    public String imageUrl;
    public String linkUrl;
    public String slot;
    public Boolean enabled;
    public Integer sortOrder;
  }
}

