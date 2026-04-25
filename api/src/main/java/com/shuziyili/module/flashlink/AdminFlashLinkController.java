package com.shuziyili.module.flashlink;

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
import org.springframework.web.bind.annotation.RestController;

/** 管理端：快讯（外链或站内一句话，不存正文）。 */
@RestController
@RequestMapping("/api/v1/admin/flash-links")
public class AdminFlashLinkController {

  private final AdminFlashLinkService flashLinkService;
  private final StaffAuthService staffAuthService;

  public AdminFlashLinkController(
      AdminFlashLinkService flashLinkService, StaffAuthService staffAuthService) {
    this.flashLinkService = flashLinkService;
    this.staffAuthService = staffAuthService;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.FLASH_LINKS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    List<AdminFlashLinkService.FlashLinkDto> items = flashLinkService.list();
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AdminFlashLinkService.FlashLinkDto>> create(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody UpsertReq req) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.FLASH_LINKS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    AdminFlashLinkService.UpdateResult r = flashLinkService.create(req);
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.item));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<AdminFlashLinkService.FlashLinkDto>> update(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") Long id,
      @RequestBody UpsertReq req) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.FLASH_LINKS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    AdminFlashLinkService.UpdateResult r = flashLinkService.update(id, req);
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.item));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> delete(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") Long id) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.FLASH_LINKS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    boolean ok = flashLinkService.delete(id);
    return ResponseEntity.ok(ok ? ApiResponse.success() : ApiResponse.fail("not_found"));
  }

  public static class UpsertReq {
    /** EXTERNAL 外链；INTERNAL 站内一句话快讯（不需要 URL）。 */
    public String linkKind;
    public String title;
    public String url;
    public String sourceLabel;
    public Long tagId;
    public Integer sortOrder;
    public Boolean enabled;
    public Long publishedAt;
  }
}
