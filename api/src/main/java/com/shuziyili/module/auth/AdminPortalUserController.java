package com.shuziyili.module.auth;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.common.SearchParams;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 管理后台：平台注册用户（{@link PortalUserEntity}） */
@RestController
@RequestMapping("/api/v1/admin/portal-users")
public class AdminPortalUserController {

  private final StaffAuthService staffAuthService;
  private final PortalUserRepository portalUserRepository;

  public AdminPortalUserController(
      StaffAuthService staffAuthService, PortalUserRepository portalUserRepository) {
    this.staffAuthService = staffAuthService;
    this.portalUserRepository = portalUserRepository;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestParam(value = "q", required = false) String q) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.PORTAL_USERS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    String needle = SearchParams.normalizedOrEmpty(q);
    List<PortalUserEntity> entities =
        needle.isEmpty()
            ? portalUserRepository.findAll()
            : portalUserRepository.findByIdentifierContainingIgnoreCaseOrderByIdDesc(needle);
    List<PortalUserDto> items = entities.stream().map(this::toDto).collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<PortalUserDto>> updateProfile(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @PathVariable("id") Long id,
      @RequestBody(required = false) UpdatePortalUserReq req) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.PORTAL_USERS_MANAGE);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }
    if (id == null) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    UpdatePortalUserReq body = req == null ? new UpdatePortalUserReq() : req;
    String err = ProfilePayloadValidator.validate(body.nickname, body.avatarUrl, body.bio);
    if (err != null) {
      return ResponseEntity.ok(ApiResponse.fail(err));
    }
    return portalUserRepository
        .findById(id)
        .map(
            (u) -> {
              ProfilePayloadValidator.applyToPortal(
                  u, body.nickname, body.avatarUrl, body.bio, System.currentTimeMillis());
              portalUserRepository.save(u);
              return ResponseEntity.ok(ApiResponse.success(toDto(u)));
            })
        .orElseGet(() -> ResponseEntity.ok(ApiResponse.fail("not_found")));
  }

  private PortalUserDto toDto(PortalUserEntity u) {
    PortalUserDto d = new PortalUserDto();
    d.id = u.getId();
    d.identifier = u.getIdentifier();
    d.createdAt = u.getCreatedAt();
    d.updatedAt = u.getUpdatedAt();
    d.nickname = u.getNickname() == null ? "" : u.getNickname();
    d.avatarUrl = u.getAvatarUrl() == null ? "" : u.getAvatarUrl();
    d.bio = u.getBio() == null ? "" : u.getBio();
    return d;
  }

  public static class PortalUserDto {
    public Long id;
    public String identifier;
    public long createdAt;
    public long updatedAt;
    public String nickname;
    public String avatarUrl;
    public String bio;
  }

  public static class UpdatePortalUserReq {
    public String nickname;
    public String avatarUrl;
    public String bio;
  }
}
