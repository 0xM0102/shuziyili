package com.shuziyili.module.auth;

import com.shuziyili.common.ApiResponse;
import java.time.Clock;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 管理后台：操作员密码登录、{@link SessionScope#STAFF} 会话校验。 与 {@link PortalAuthService} 使用同一 {@link
 * SessionRepository}，靠 {@link SessionEntity#getScope()} 区分。
 */
@Service
public class StaffAuthService {

  private static final long SESSION_TTL_MILLIS = 7L * 24 * 60 * 60 * 1000;

  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);
  private final Clock clock = Clock.systemUTC();
  private final StaffUserRepository staffUserRepository;
  private final SessionRepository sessionRepository;

  public StaffAuthService(StaffUserRepository staffUserRepository, SessionRepository sessionRepository) {
    this.staffUserRepository = staffUserRepository;
    this.sessionRepository = sessionRepository;
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
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      return ApiResponse.fail("wrong_password");
    }
    SessionEntity session = issueStaffSession(identifier);
    return ApiResponse.success(Map.of("token", session.getToken(), "identifier", identifier));
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
