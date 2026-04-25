package com.shuziyili.module.auth;

import com.shuziyili.common.ApiResponse;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminPermissionController {

  private final StaffAuthService staffAuthService;
  private final StaffRoleRepository staffRoleRepository;
  private final StaffPermissionRepository staffPermissionRepository;
  private final StaffRolePermissionRepository staffRolePermissionRepository;

  public AdminPermissionController(
      StaffAuthService staffAuthService,
      StaffRoleRepository staffRoleRepository,
      StaffPermissionRepository staffPermissionRepository,
      StaffRolePermissionRepository staffRolePermissionRepository) {
    this.staffAuthService = staffAuthService;
    this.staffRoleRepository = staffRoleRepository;
    this.staffPermissionRepository = staffPermissionRepository;
    this.staffRolePermissionRepository = staffRolePermissionRepository;
  }

  @GetMapping("/staff-roles")
  public ResponseEntity<ApiResponse<List<StaffRoleDto>>> listRoles(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.PERMISSIONS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    List<StaffRoleEntity> roles = staffRoleRepository.findAllByOrderBySortOrderAscRoleNameAsc();
    List<StaffRoleDto> items = roles.stream().map(this::toRoleDto).collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.success(items));
  }

  @GetMapping("/staff-permissions")
  public ResponseEntity<ApiResponse<List<StaffPermissionDto>>> listPermissions(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.PERMISSIONS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    List<StaffPermissionEntity> permissions =
        staffPermissionRepository.findAllByOrderByPermissionCodeAsc();
    List<StaffPermissionDto> items = permissions.stream().map(this::toPermDto).collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.success(items));
  }

  @GetMapping("/staff-roles/{roleName}/permissions")
  public ResponseEntity<ApiResponse<Map<String, Object>>> listRolePermissions(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("roleName") String roleName) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.PERMISSIONS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }

    if (roleName == null || roleName.isBlank()) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }

    boolean roleExists = staffRoleRepository.findById(roleName).isPresent();
    if (!roleExists) {
      return ResponseEntity.ok(ApiResponse.fail("not_found"));
    }

    List<StaffRolePermissionEntity> rows =
        staffRolePermissionRepository.findAllByRoleNameAndEnabledTrue(roleName);
    List<String> permissionCodes =
        rows.stream().map(StaffRolePermissionEntity::getPermissionCode).collect(Collectors.toList());

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("roleName", roleName);
    body.put("permissionCodes", permissionCodes);
    return ResponseEntity.ok(ApiResponse.success(body));
  }

  @PutMapping("/staff-roles/{roleName}/permissions")
  public ResponseEntity<ApiResponse<Map<String, Object>>> setRolePermissions(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("roleName") String roleName,
      @RequestBody(required = false) SetRolePermissionsReq req) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.PERMISSIONS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }

    if (roleName == null || roleName.isBlank()) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }

    if (req == null || req.permissionCodes == null) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }

    if (staffRoleRepository.findById(roleName).isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("not_found"));
    }

    long now = System.currentTimeMillis();
    List<String> codes = req.permissionCodes.stream()
        .filter(Objects::nonNull)
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .distinct()
        .collect(Collectors.toList());

    // 校验权限存在 & 启用
    List<String> invalid =
        codes.stream()
            .filter(code -> {
              StaffPermissionEntity p =
                  staffPermissionRepository
                      .findById(java.util.Objects.requireNonNull(code))
                      .orElse(null);
              return p == null || !p.isEnabled();
            })
            .collect(Collectors.toList());
    if (!invalid.isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("invalid_permission_code"));
    }

    // 替换：先删后插
    staffRolePermissionRepository.deleteByRoleName(roleName);
    for (String code : codes) {
      StaffRolePermissionEntity e = new StaffRolePermissionEntity();
      e.setRoleName(roleName);
      e.setPermissionCode(code);
      e.setEnabled(true);
      e.setCreatedAt(now);
      e.setUpdatedAt(now);
      staffRolePermissionRepository.save(e);
    }

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("roleName", roleName);
    body.put("permissionCodes", new ArrayList<>(codes));
    return ResponseEntity.ok(ApiResponse.success(body));
  }

  private StaffRoleDto toRoleDto(StaffRoleEntity r) {
    StaffRoleDto d = new StaffRoleDto();
    d.roleName = r.getRoleName();
    d.displayName = r.getDisplayName();
    d.enabled = r.isEnabled();
    d.sortOrder = r.getSortOrder();
    return d;
  }

  private StaffPermissionDto toPermDto(StaffPermissionEntity p) {
    StaffPermissionDto d = new StaffPermissionDto();
    d.permissionCode = p.getPermissionCode();
    d.displayName = p.getDisplayName();
    d.description = p.getDescription();
    d.enabled = p.isEnabled();
    return d;
  }

  public static class SetRolePermissionsReq {
    public List<String> permissionCodes;
  }

  public static class StaffRoleDto {
    public String roleName;
    public String displayName;
    public boolean enabled;
    public int sortOrder;
  }

  public static class StaffPermissionDto {
    public String permissionCode;
    public String displayName;
    public String description;
    public boolean enabled;
  }
}

