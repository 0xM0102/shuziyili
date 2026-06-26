package com.shuziyili.module.event;

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
@RequestMapping("/api/v1/admin/events")
public class AdminEventController {

  private final AdminEventService eventService;
  private final StaffAuthService staffAuthService;
  private final Clock clock = Clock.systemUTC();

  public AdminEventController(AdminEventService eventService, StaffAuthService staffAuthService) {
    this.eventService = eventService;
    this.staffAuthService = staffAuthService;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.EVENTS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    List<AdminEventService.EventDto> items = eventService.listAll();
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<AdminEventService.EventDto>> create(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody AdminEventService.UpsertReq req) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.EVENTS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    AdminEventService.CreateResult r = eventService.create(req, clock.millis());
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.item));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<AdminEventService.EventDto>> update(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") String id,
      @RequestBody AdminEventService.UpsertReq req) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.EVENTS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    AdminEventService.UpdateResult r = eventService.update(id, req, clock.millis());
    if (!r.ok) {
      return ResponseEntity.ok(ApiResponse.fail(r.message));
    }
    return ResponseEntity.ok(ApiResponse.success(r.item));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> delete(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") String id) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.EVENTS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    boolean ok = eventService.delete(id);
    return ResponseEntity.ok(ok ? ApiResponse.success() : ApiResponse.fail("not_found"));
  }
}
