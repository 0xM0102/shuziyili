package com.shuziyili.module.auth;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.common.BearerTokens;
import com.shuziyili.module.auth.StaffPermissionCodes;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 管理后台：操作员账号（{@link StaffUserEntity}） */
@RestController
@RequestMapping("/api/v1/admin/staff")
public class AdminStaffController {

  private final StaffAuthService staffAuthService;
  private final StaffUserRepository staffUserRepository;
  private final org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder =
      new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12);

  public AdminStaffController(StaffAuthService staffAuthService, StaffUserRepository staffUserRepository) {
    this.staffAuthService = staffAuthService;
    this.staffUserRepository = staffUserRepository;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestParam(value = "q", required = false) String q) {
    String token = BearerTokens.extract(authorization);
    if (!staffAuthService.requireStaffPermission(token, StaffPermissionCodes.STAFF_MANAGE).isOk()) {
      return ResponseEntity.ok(ApiResponse.fail("forbidden"));
    }
    String needle = q == null ? "" : q.trim();
    List<StaffUserEntity> entities =
        needle.isEmpty()
            ? staffUserRepository.findAll()
            : staffUserRepository.findByIdentifierContainingIgnoreCaseOrderByIdDesc(needle);
    List<StaffDto> items = entities.stream().map(this::toDto).collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }

  @PutMapping("/{id}/role")
  public ResponseEntity<ApiResponse<StaffDto>> setRole(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") Long id,
      @RequestBody SetRoleReq req) {
    String token = BearerTokens.extract(authorization);
    if (!staffAuthService.requireStaffPermission(token, StaffPermissionCodes.STAFF_MANAGE).isOk()) {
      return ResponseEntity.ok(ApiResponse.fail("forbidden"));
    }
    if (id == null) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    String role = req == null ? null : req.role;
    if (!"admin".equals(role) && !"editor".equals(role) && !"operator".equals(role) && !"viewer".equals(role)) {
      return ResponseEntity.ok(ApiResponse.fail("invalid_role"));
    }
    return staffUserRepository
        .findById(id)
        .map(
            (u) -> {
              u.setRole(role);
              staffUserRepository.save(u);
              return ResponseEntity.ok(ApiResponse.success(toDto(u)));
            })
        .orElseGet(() -> ResponseEntity.ok(ApiResponse.fail("not_found")));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<StaffDto>> updateProfile(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") Long id,
      @RequestBody(required = false) UpdateStaffProfileReq req) {
    String token = BearerTokens.extract(authorization);
    if (!staffAuthService.requireStaffPermission(token, StaffPermissionCodes.STAFF_MANAGE).isOk()) {
      return ResponseEntity.ok(ApiResponse.fail("forbidden"));
    }
    if (id == null) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    UpdateStaffProfileReq body = req == null ? new UpdateStaffProfileReq() : req;
    String err = ProfilePayloadValidator.validate(body.nickname, body.avatarUrl, body.bio);
    if (err != null) {
      return ResponseEntity.ok(ApiResponse.fail(err));
    }
    return staffUserRepository
        .findById(id)
        .map(
            (u) -> {
              StaffUserEntity u2 = java.util.Objects.requireNonNull(u);
              ProfilePayloadValidator.applyToStaff(
                  u2,
                  body.nickname,
                  body.avatarUrl,
                  body.bio,
                  System.currentTimeMillis());
              staffUserRepository.save(u2);
              return ResponseEntity.ok(ApiResponse.success(toDto(u2)));
            })
        .orElseGet(() -> ResponseEntity.ok(ApiResponse.fail("not_found")));
  }

  @PostMapping
  public ResponseEntity<ApiResponse<StaffDto>> create(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody CreateStaffReq req) {
    String token = BearerTokens.extract(authorization);
    if (!staffAuthService.requireStaffPermission(token, StaffPermissionCodes.STAFF_MANAGE).isOk()) {
      return ResponseEntity.ok(ApiResponse.fail("forbidden"));
    }
    if (req == null || req.identifier == null || req.identifier.trim().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    if (req.password == null || req.password.trim().length() < 6) {
      return ResponseEntity.ok(ApiResponse.fail("weak_password"));
    }
    String role = req.role == null || req.role.isBlank() ? "editor" : req.role.trim();
    if (!"admin".equals(role) && !"editor".equals(role) && !"operator".equals(role) && !"viewer".equals(role)) {
      return ResponseEntity.ok(ApiResponse.fail("invalid_role"));
    }
    String identifier = req.identifier.trim();
    if (staffUserRepository.findByIdentifier(identifier).isPresent()) {
      return ResponseEntity.ok(ApiResponse.fail("already_exists"));
    }
    long now = System.currentTimeMillis();
    StaffUserEntity u = new StaffUserEntity();
    u.setIdentifier(identifier);
    u.setPasswordHash(passwordEncoder.encode(req.password));
    u.setRole(role);
    u.setCreatedAt(now);
    u.setNickname("");
    u.setAvatarUrl("");
    u.setBio("");
    u.setUpdatedAt(now);
    String perr = ProfilePayloadValidator.validate(req.nickname, req.avatarUrl, req.bio);
    if (perr != null) {
      return ResponseEntity.ok(ApiResponse.fail(perr));
    }
    ProfilePayloadValidator.applyToStaff(u, req.nickname, req.avatarUrl, req.bio, now);
    staffUserRepository.save(u);
    return ResponseEntity.ok(ApiResponse.success(toDto(u)));
  }

  private StaffDto toDto(StaffUserEntity u) {
    StaffDto d = new StaffDto();
    d.id = u.getId();
    d.identifier = u.getIdentifier();
    d.role = u.getRole() == null || u.getRole().isBlank() ? "editor" : u.getRole();
    d.createdAt = u.getCreatedAt();
    d.updatedAt = u.getUpdatedAt();
    d.nickname = u.getNickname() == null ? "" : u.getNickname();
    d.avatarUrl = u.getAvatarUrl() == null ? "" : u.getAvatarUrl();
    d.bio = u.getBio() == null ? "" : u.getBio();
    return d;
  }

  public static class SetRoleReq {
    public String role;
  }

  public static class StaffDto {
    public Long id;
    public String identifier;
    public String role;
    public long createdAt;
    public long updatedAt;
    public String nickname;
    public String avatarUrl;
    public String bio;
  }

  public static class CreateStaffReq {
    public String identifier;
    public String password;
    public String role;
    public String nickname;
    public String avatarUrl;
    public String bio;
  }

  public static class UpdateStaffProfileReq {
    public String nickname;
    public String avatarUrl;
    public String bio;
  }
}
