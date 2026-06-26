package com.shuziyili.module.convenience;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.module.auth.StaffAuthService;
import com.shuziyili.module.auth.StaffPermissionCodes;
import java.time.Clock;
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

@RestController
@RequestMapping("/api/v1/admin/convenience")
public class AdminConvenienceController {

  private final AdminConvenienceService convenienceService;
  private final StaffAuthService staffAuthService;
  private final Clock clock = Clock.systemUTC();

  public AdminConvenienceController(
      AdminConvenienceService convenienceService, StaffAuthService staffAuthService) {
    this.convenienceService = convenienceService;
    this.staffAuthService = staffAuthService;
  }

  @GetMapping("/categories")
  public ResponseEntity<ApiResponse<Map<String, Object>>> listCategories(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String denied = permissionDenied(authorization);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    List<AdminConvenienceService.CategoryDto> items = convenienceService.listCategories();
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }

  @PostMapping("/categories")
  public ResponseEntity<ApiResponse<AdminConvenienceService.CategoryDto>> createCategory(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody AdminConvenienceService.CategoryUpsertReq req) {
    String denied = permissionDenied(authorization);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    AdminConvenienceService.CategoryResult r = convenienceService.createCategory(req, clock.millis());
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.item));
  }

  @PutMapping("/categories/{slug}")
  public ResponseEntity<ApiResponse<AdminConvenienceService.CategoryDto>> updateCategory(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("slug") String slug,
      @RequestBody AdminConvenienceService.CategoryUpsertReq req) {
    String denied = permissionDenied(authorization);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    AdminConvenienceService.CategoryResult r =
        convenienceService.updateCategory(slug, req, clock.millis());
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.item));
  }

  @DeleteMapping("/categories/{slug}")
  public ResponseEntity<ApiResponse<Void>> deleteCategory(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("slug") String slug) {
    String denied = permissionDenied(authorization);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    AdminConvenienceService.DeleteResult r = convenienceService.deleteCategory(slug);
    return ResponseEntity.ok(r.ok ? ApiResponse.success() : ApiResponse.fail(r.message));
  }

  @GetMapping("/services")
  public ResponseEntity<ApiResponse<Map<String, Object>>> listServices(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String denied = permissionDenied(authorization);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    List<AdminConvenienceService.ServiceDto> items = convenienceService.listServices();
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }

  @PostMapping("/services")
  public ResponseEntity<ApiResponse<AdminConvenienceService.ServiceDto>> createService(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody AdminConvenienceService.ServiceUpsertReq req) {
    String denied = permissionDenied(authorization);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    AdminConvenienceService.ServiceResult r = convenienceService.createService(req, clock.millis());
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.item));
  }

  @PutMapping("/services/{id}")
  public ResponseEntity<ApiResponse<AdminConvenienceService.ServiceDto>> updateService(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") String id,
      @RequestBody AdminConvenienceService.ServiceUpsertReq req) {
    String denied = permissionDenied(authorization);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    AdminConvenienceService.ServiceResult r =
        convenienceService.updateService(id, req, clock.millis());
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.item));
  }

  @DeleteMapping("/services/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteService(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") String id) {
    String denied = permissionDenied(authorization);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    boolean ok = convenienceService.deleteService(id);
    return ResponseEntity.ok(ok ? ApiResponse.success() : ApiResponse.fail("not_found"));
  }

  private String permissionDenied(String authorization) {
    return staffAuthService.staffPermissionDenied(
        authorization, StaffPermissionCodes.CONVENIENCE_MANAGE);
  }
}
