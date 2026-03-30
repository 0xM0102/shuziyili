package com.shuziyili.module.auth;

import com.shuziyili.common.ApiResponse;
import java.time.Clock;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 管理后台：操作员密码登录、{@link SessionScope#STAFF} 会话校验。 与 {@link PortalAuthService} 使用同一 {@link
 * SessionRepository}，靠 {@link SessionEntity#getScope()} 区分。
 */
@Service
public class StaffAuthService {

  private static final Logger log = LoggerFactory.getLogger(StaffAuthService.class);

  private static final long SESSION_TTL_MILLIS = 7L * 24 * 60 * 60 * 1000;

  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);
  private final Clock clock = Clock.systemUTC();
  private final StaffUserRepository staffUserRepository;
  private final SessionRepository sessionRepository;
  private final StaffRoleRepository staffRoleRepository;
  private final StaffPermissionRepository staffPermissionRepository;
  private final StaffRolePermissionRepository staffRolePermissionRepository;

  public StaffAuthService(
      StaffUserRepository staffUserRepository,
      SessionRepository sessionRepository,
      StaffRoleRepository staffRoleRepository,
      StaffPermissionRepository staffPermissionRepository,
      StaffRolePermissionRepository staffRolePermissionRepository) {
    this.staffUserRepository = staffUserRepository;
    this.sessionRepository = sessionRepository;
    this.staffRoleRepository = staffRoleRepository;
    this.staffPermissionRepository = staffPermissionRepository;
    this.staffRolePermissionRepository = staffRolePermissionRepository;
  }

  @Transactional
  public ApiResponse<Map<String, String>> staffLogin(String identifierRaw, String password) {
    String identifier = AccountIdentifiers.normalize(identifierRaw);
    String validation = AccountIdentifiers.validate(identifier);
    if (validation != null) {
      return ApiResponse.fail(validation);
    }
    if (password == null || password.trim().isEmpty()) {
      return ApiResponse.fail("wrong_password");
    }
    Optional<StaffUserEntity> userOpt = staffUserRepository.findByIdentifier(identifier);
    if (userOpt.isEmpty()) {
      return ApiResponse.fail("not_found");
    }
    StaffUserEntity user = userOpt.get();
    String hash = user.getPasswordHash();
    if (hash == null || hash.isBlank()) {
      log.warn("staff login: empty password_hash for identifier={}", identifier);
      return ApiResponse.fail("wrong_password");
    }
    boolean match;
    try {
      match = passwordEncoder.matches(password, hash);
    } catch (IllegalArgumentException e) {
      // 库中若非合法 BCrypt 串，matches 会抛异常，否则前端收到 500
      log.warn("staff login: invalid bcrypt hash for identifier={}: {}", identifier, e.getMessage());
      return ApiResponse.fail("wrong_password");
    }
    if (!match) {
      return ApiResponse.fail("wrong_password");
    }
    try {
      SessionEntity session = issueStaffSession(identifier);
      return ApiResponse.success(Map.of("token", session.getToken(), "identifier", identifier));
    } catch (DataAccessException e) {
      log.error("staff login: failed to persist session for identifier={}", identifier, e);
      return ApiResponse.fail("server_error");
    }
  }

  @Transactional(readOnly = true)
  public ApiResponse<Map<String, String>> staffMe(String bearerToken) {
    Optional<StaffUserEntity> uo = resolveStaffFromValidSession(bearerToken);
    if (uo.isEmpty()) {
      return ApiResponse.fail("unauthorized");
    }
    StaffUserEntity u = uo.get();
    String identifier = u.getIdentifier();
    String role = u.getRole() == null || u.getRole().isBlank() ? "editor" : u.getRole();
    Map<String, String> m = new LinkedHashMap<>();
    m.put("identifier", identifier);
    m.put("role", role);
    m.put("displayName", nullToEmpty(u.getDisplayName()));
    m.put("nickname", nullToEmpty(u.getNickname()));
    m.put("avatarUrl", nullToEmpty(u.getAvatarUrl()));
    m.put("bio", nullToEmpty(u.getBio()));
    m.put("createdAt", Long.toString(u.getCreatedAt()));
    m.put("updatedAt", Long.toString(u.getUpdatedAt()));
    return ApiResponse.success(m);
  }

  @Transactional
  public ApiResponse<Void> staffLogout(String bearerToken) {
    if (bearerToken == null || bearerToken.isBlank()) {
      return ApiResponse.fail("unauthorized");
    }
    sessionRepository.deleteById(bearerToken);
    return ApiResponse.success();
  }

  @Transactional(readOnly = true)
  public ApiResponse<Void> requireStaff(String bearerToken) {
    if (resolveStaffFromValidSession(bearerToken).isEmpty()) {
      return ApiResponse.fail("unauthorized");
    }
    return ApiResponse.success();
  }

  @Transactional(readOnly = true)
  public ApiResponse<Void> requireStaffAdmin(String bearerToken) {
    Optional<StaffUserEntity> uo = resolveStaffFromValidSession(bearerToken);
    if (uo.isEmpty()) {
      return ApiResponse.fail("unauthorized");
    }
    if (!"admin".equals(uo.get().getRole())) {
      return ApiResponse.fail("forbidden");
    }
    return ApiResponse.success();
  }

  /**
   * 权限校验：先验证会话与 role 是否存在且启用，再校验 role->permission 映射。
   *
   * <p>若任一条件不满足（包括权限不存在/禁用），返回 forbidden。
   */
  @Transactional(readOnly = true)
  public ApiResponse<Void> requireStaffPermission(String bearerToken, String permissionCode) {
    Optional<StaffUserEntity> uo = resolveStaffFromValidSession(bearerToken);
    if (uo.isEmpty()) {
      return ApiResponse.fail("unauthorized");
    }
    StaffUserEntity u = uo.get();
    String role = u.getRole() == null || u.getRole().isBlank() ? "editor" : u.getRole();
    if (permissionCode == null || permissionCode.isBlank()) {
      return ApiResponse.fail("forbidden");
    }

    boolean roleEnabled =
        staffRoleRepository
            .findById(java.util.Objects.requireNonNull(role))
            .map(StaffRoleEntity::isEnabled)
            .orElse(false);
    if (!roleEnabled) {
      return ApiResponse.fail("forbidden");
    }

    boolean permissionEnabled =
        staffPermissionRepository.findById(permissionCode).map(StaffPermissionEntity::isEnabled).orElse(false);
    if (!permissionEnabled) {
      return ApiResponse.fail("forbidden");
    }

    boolean has =
        staffRolePermissionRepository.existsByRoleNameAndPermissionCodeAndEnabledTrue(role, permissionCode);
    if (!has) {
      return ApiResponse.fail("forbidden");
    }

    return ApiResponse.success();
  }

  private Optional<StaffUserEntity> resolveStaffFromValidSession(String bearerToken) {
    if (bearerToken == null || bearerToken.isBlank()) {
      return Optional.empty();
    }
    Optional<SessionEntity> opt = sessionRepository.findById(bearerToken);
    if (opt.isEmpty()) {
      return Optional.empty();
    }
    SessionEntity session = opt.get();
    if (session.getExpiresAt() <= clock.millis()) {
      sessionRepository.deleteById(bearerToken);
      return Optional.empty();
    }
    String sc = session.getScope();
    if (sc == null || sc.isBlank()) {
      sc = SessionScope.STAFF.name();
    }
    if (!SessionScope.STAFF.name().equals(sc)) {
      return Optional.empty();
    }
    return staffUserRepository.findByIdentifier(session.getIdentifier());
  }

  private SessionEntity issueStaffSession(String identifier) {
    SessionEntity session = new SessionEntity();
    session.setToken(UUID.randomUUID().toString().replace("-", ""));
    session.setIdentifier(identifier);
    session.setScope(SessionScope.STAFF.name());
    session.setCreatedAt(clock.millis());
    session.setExpiresAt(session.getCreatedAt() + SESSION_TTL_MILLIS);
    return sessionRepository.save(session);
  }

  private static String nullToEmpty(String s) {
    return s == null ? "" : s;
  }
}
