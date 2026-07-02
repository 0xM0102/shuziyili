package com.shuziyili.module.settings;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.module.auth.StaffAuthService;
import com.shuziyili.module.auth.StaffPermissionCodes;
import com.shuziyili.module.news.TianAreaNewsProvider;
import java.util.Map;
import java.util.Set;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 管理后台：门户配置（资讯/天气数据源、首页地区块；API Key 仍由 env 配置）。 */
@RestController
@RequestMapping("/api/v1/admin/portal-settings")
public class AdminPortalSettingsController {

  private static final Set<String> ITEM_UPDATE_ERRORS =
      Set.of(
          "invalid_setting_key",
          "unknown_setting_key",
          "tianapi_areaname_too_long",
          "source_not_configured");

  private final StaffAuthService staffAuthService;
  private final PortalSettingsService portalSettingsService;
  private final TianAreaNewsProvider tianAreaNewsProvider;

  public AdminPortalSettingsController(
      StaffAuthService staffAuthService,
      PortalSettingsService portalSettingsService,
      TianAreaNewsProvider tianAreaNewsProvider) {
    this.staffAuthService = staffAuthService;
    this.portalSettingsService = portalSettingsService;
    this.tianAreaNewsProvider = tianAreaNewsProvider;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> get(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String denied = denyReason(authorization);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    return ResponseEntity.ok(ApiResponse.success(portalSettingsService.adminView()));
  }

  @PutMapping("/item")
  public ResponseEntity<ApiResponse<Void>> updateItem(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody(required = false) PortalSettingItemUpdateBody body) {
    String denied = denyReason(authorization);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    if (body == null || body.settingKey == null) {
      return ResponseEntity.ok(ApiResponse.fail("invalid_body"));
    }
    return runUpdate(
        () -> portalSettingsService.adminUpdateItem(body.settingKey, body.value), ITEM_UPDATE_ERRORS);
  }

  private String denyReason(String authorization) {
    return staffAuthService.staffPermissionDenied(
        authorization, StaffPermissionCodes.PORTAL_SETTINGS_MANAGE);
  }

  private ResponseEntity<ApiResponse<Void>> runUpdate(Runnable action, Set<String> knownErrors) {
    try {
      action.run();
      tianAreaNewsProvider.resetCache();
      return ResponseEntity.ok(ApiResponse.success());
    } catch (IllegalArgumentException e) {
      String msg = e.getMessage();
      if (knownErrors.contains(msg)) {
        return ResponseEntity.ok(ApiResponse.fail(msg));
      }
      throw e;
    }
  }
}
