package com.shuziyili.module.media;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.config.CosProperties;
import com.shuziyili.module.auth.StaffAuthService;
import com.shuziyili.module.auth.StaffPermissionCodes;
import com.shuziyili.module.media.CosStorageService.MediaItem;
import com.shuziyili.module.media.CosStorageService.UploadResult;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/media")
public class MediaAdminController {

  private final StaffAuthService staffAuthService;
  private final CosProperties cosProperties;
  private final CosStorageService cosStorageService;

  public MediaAdminController(
      StaffAuthService staffAuthService,
      CosProperties cosProperties,
      CosStorageService cosStorageService) {
    this.staffAuthService = staffAuthService;
    this.cosProperties = cosProperties;
    this.cosStorageService = cosStorageService;
  }

  /** 只读配置（不含密钥），供管理后台展示 */
  @GetMapping("/config")
  public ResponseEntity<ApiResponse<Map<String, Object>>> config(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.MEDIA_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("enabled", cosProperties.isEnabled());
    m.put("configured", cosStorageService.ready());
    m.put("region", cosProperties.getRegion());
    m.put("bucket", cosProperties.getBucket());
    m.put("publicBaseUrl", cosProperties.getPublicBaseUrl());
    m.put("keyPrefix", cosProperties.getKeyPrefix());
    return ResponseEntity.ok(ApiResponse.success(m));
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestParam(value = "prefix", required = false) String prefix) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.MEDIA_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    try {
      List<MediaItem> items = cosStorageService.list(prefix);
      return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
    } catch (IllegalStateException e) {
      return ResponseEntity.ok(ApiResponse.fail(e.getMessage()));
    }
  }

  /**
   * 上传文件到 COS。可选 {@code scope}：{@code cms}（默认，文章/Banner/媒体库）、{@code staff_avatar}（后台操作员头像）。
   */
  @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ApiResponse<UploadResult>> upload(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestParam(value = "scope", required = false) String scope,
      @RequestParam("file") MultipartFile file) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.MEDIA_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    try {
      CosUploadScope uploadScope = CosUploadScope.fromAdminQuery(scope);
      return ResponseEntity.ok(ApiResponse.success(cosStorageService.upload(file, uploadScope)));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.ok(ApiResponse.fail(e.getMessage()));
    } catch (IllegalStateException e) {
      return ResponseEntity.ok(ApiResponse.fail(e.getMessage()));
    }
  }

  @DeleteMapping
  public ResponseEntity<ApiResponse<Void>> delete(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestParam("key") String key) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.MEDIA_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    try {
      cosStorageService.delete(key);
      return ResponseEntity.ok(ApiResponse.success());
    } catch (IllegalArgumentException e) {
      return ResponseEntity.ok(ApiResponse.fail(e.getMessage()));
    } catch (IllegalStateException e) {
      return ResponseEntity.ok(ApiResponse.fail(e.getMessage()));
    }
  }

}
