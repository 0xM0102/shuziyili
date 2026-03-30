package com.shuziyili.module.flashlink;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.common.BearerTokens;
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

/** 后台 CRUD：快讯/文章标签（用于快讯时间线展示与分类）。 */
@RestController
@RequestMapping("/api/v1/admin/flash-tags")
public class AdminFlashTagController {

  private final AdminFlashTagService flashTagService;
  private final StaffAuthService staffAuthService;

  public AdminFlashTagController(AdminFlashTagService flashTagService, StaffAuthService staffAuthService) {
    this.flashTagService = flashTagService;
    this.staffAuthService = staffAuthService;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestParam(value = "targetKind", required = false) String targetKind) {
    String token = BearerTokens.extract(authorization);
    if (!staffAuthService.requireStaffPermission(token, StaffPermissionCodes.FLASH_TAGS_MANAGE).isOk()) {
      return ResponseEntity.ok(ApiResponse.fail("unauthorized"));
    }
    List<AdminFlashTagService.FlashTagDto> items = flashTagService.list(targetKind);
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AdminFlashTagService.FlashTagDto>> create(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody UpsertReq req) {
    String token = BearerTokens.extract(authorization);
    if (!staffAuthService.requireStaffPermission(token, StaffPermissionCodes.FLASH_TAGS_MANAGE).isOk()) {
      return ResponseEntity.ok(ApiResponse.fail("unauthorized"));
    }
    AdminFlashTagService.UpdateResult r = flashTagService.create(req);
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.item));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<AdminFlashTagService.FlashTagDto>> update(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") Long id,
      @RequestBody UpsertReq req) {
    String token = BearerTokens.extract(authorization);
    if (!staffAuthService.requireStaffPermission(token, StaffPermissionCodes.FLASH_TAGS_MANAGE).isOk()) {
      return ResponseEntity.ok(ApiResponse.fail("unauthorized"));
    }
    AdminFlashTagService.UpdateResult r = flashTagService.update(id, req);
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.item));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> delete(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") Long id) {
    String token = BearerTokens.extract(authorization);
    if (!staffAuthService.requireStaffPermission(token, StaffPermissionCodes.FLASH_TAGS_MANAGE).isOk()) {
      return ResponseEntity.ok(ApiResponse.fail("unauthorized"));
    }
    boolean ok = flashTagService.delete(id);
    return ResponseEntity.ok(ok ? ApiResponse.success() : ApiResponse.fail("not_found"));
  }

  public static class UpsertReq {
    /** FLASH / ARTICLE */
    public String targetKind;
    public String label;
    public Boolean enabled;
    public Integer sortOrder;
  }
}

