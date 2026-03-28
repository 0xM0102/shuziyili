package com.shuziyili.module.auth;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.module.sms.SmsCodeEntity;
import com.shuziyili.module.sms.SmsCodeRepository;
import com.shuziyili.module.sms.SmsScene;
import com.shuziyili.module.sms.SmsSender;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 门户 C 端：注册、登录、短信验证码、个人资料。 数据仅 {@link PortalUserEntity}，会话 scope={@link
 * SessionScope#PORTAL}，与 {@link StaffAuthService} 互不通用。
 */
@Service
public class PortalAuthService {

  private static final long SESSION_TTL_MILLIS = 7L * 24 * 60 * 60 * 1000;
  private static final long SMS_CODE_TTL_MS = 5 * 60_000;
  private static final long SMS_SEND_COOLDOWN_MS = 60_000;

  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);
  private final Clock clock = Clock.systemUTC();
  private final PortalUserRepository portalUserRepository;
  private final SessionRepository sessionRepository;
  private final SmsCodeRepository smsCodeRepository;
  private final SmsSender smsSender;
  private final SecureRandom random = new SecureRandom();

  public PortalAuthService(
      PortalUserRepository portalUserRepository,
      SessionRepository sessionRepository,
      SmsCodeRepository smsCodeRepository,
      SmsSender smsSender) {
    this.portalUserRepository = portalUserRepository;
    this.sessionRepository = sessionRepository;
    this.smsCodeRepository = smsCodeRepository;
    this.smsSender = smsSender;
  }

  @Transactional
  public ApiResponse<Map<String, String>> register(String identifierRaw, String password) {
    String identifier = AccountIdentifiers.normalize(identifierRaw);
    String validation = AccountIdentifiers.validate(identifier);
    if (validation != null) {
      return ApiResponse.fail(validation);
    }
    if (password == null || password.trim().length() < 6) {
      return ApiResponse.fail("weak_password");
    }
    if (portalUserRepository.findByIdentifier(identifier).isPresent()) {
      return ApiResponse.fail("already_exists");
    }
    long now = clock.millis();
    portalUserRepository.save(newPortalUser(identifier, passwordEncoder.encode(password), now));
    SessionEntity session = issuePortalSession(identifier);
    return ApiResponse.success(Map.of("token", session.getToken(), "identifier", identifier));
  }

  @Transactional
  public ApiResponse<Map<String, String>> login(String identifierRaw, String password) {
    String identifier = AccountIdentifiers.normalize(identifierRaw);
    String validation = AccountIdentifiers.validate(identifier);
    if (validation != null) {
      return ApiResponse.fail(validation);
    }
    if (password == null || password.trim().isEmpty()) {
      return ApiResponse.fail("wrong_password");
    }
    Optional<PortalUserEntity> userOpt = portalUserRepository.findByIdentifier(identifier);
    if (userOpt.isEmpty()) {
      return ApiResponse.fail("not_found");
    }
    PortalUserEntity user = userOpt.get();
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      return ApiResponse.fail("wrong_password");
    }
    SessionEntity session = issuePortalSession(identifier);
    return ApiResponse.success(Map.of("token", session.getToken(), "identifier", identifier));
  }

  @Transactional
  public ApiResponse<Map<String, String>> sendLoginSmsCode(String phoneRaw) {
    String phone = AccountIdentifiers.normalize(phoneRaw);
    String validation = AccountIdentifiers.validate(phone);
    if (validation != null) {
      return ApiResponse.fail(validation);
    }
    if (!AccountIdentifiers.isPhone(phone)) {
      return ApiResponse.fail("invalid");
    }
    if (portalUserRepository.findByIdentifier(phone).isEmpty()) {
      return ApiResponse.fail("not_found");
    }
    return issueSmsCodeAndSend(phone, SmsScene.LOGIN);
  }

  @Transactional
  public ApiResponse<Map<String, String>> sendRegisterSmsCode(String phoneRaw) {
    String phone = AccountIdentifiers.normalize(phoneRaw);
    String validation = AccountIdentifiers.validate(phone);
    if (validation != null) {
      return ApiResponse.fail(validation);
    }
    if (!AccountIdentifiers.isPhone(phone)) {
      return ApiResponse.fail("invalid");
    }
    if (portalUserRepository.findByIdentifier(phone).isPresent()) {
      return ApiResponse.fail("already_exists");
    }
    return issueSmsCodeAndSend(phone, SmsScene.REGISTER);
  }

  @Transactional
  public ApiResponse<Map<String, String>> loginBySmsCode(String phoneRaw, String codeRaw) {
    String phone = AccountIdentifiers.normalize(phoneRaw);
    String validation = AccountIdentifiers.validate(phone);
    if (validation != null) {
      return ApiResponse.fail(validation);
    }
    if (!AccountIdentifiers.isPhone(phone)) {
      return ApiResponse.fail("invalid");
    }
    String err = verifyAndConsumeSmsCode(phone, SmsScene.LOGIN, codeRaw);
    if (err != null) {
      return ApiResponse.fail(err);
    }
    if (portalUserRepository.findByIdentifier(phone).isEmpty()) {
      return ApiResponse.fail("not_found");
    }
    SessionEntity session = issuePortalSession(phone);
    return ApiResponse.success(Map.of("token", session.getToken(), "identifier", phone));
  }

  @Transactional
  public ApiResponse<Map<String, String>> registerBySmsCode(String phoneRaw, String codeRaw, String password) {
    String phone = AccountIdentifiers.normalize(phoneRaw);
    String validation = AccountIdentifiers.validate(phone);
    if (validation != null) {
      return ApiResponse.fail(validation);
    }
    if (!AccountIdentifiers.isPhone(phone)) {
      return ApiResponse.fail("invalid");
    }
    if (password == null || password.trim().length() < 6) {
      return ApiResponse.fail("weak_password");
    }
    if (portalUserRepository.findByIdentifier(phone).isPresent()) {
      return ApiResponse.fail("already_exists");
    }
    String err = verifyAndConsumeSmsCode(phone, SmsScene.REGISTER, codeRaw);
    if (err != null) {
      return ApiResponse.fail(err);
    }
    long now = clock.millis();
    portalUserRepository.save(newPortalUser(phone, passwordEncoder.encode(password), now));
    SessionEntity session = issuePortalSession(phone);
    return ApiResponse.success(Map.of("token", session.getToken(), "identifier", phone));
  }

  @Transactional(readOnly = true)
  public ApiResponse<Map<String, String>> me(String bearerToken) {
    Optional<SessionEntity> row = resolveLivePortalSession(bearerToken);
    if (row.isEmpty()) {
      return ApiResponse.fail("unauthorized");
    }
    String identifier = row.get().getIdentifier();
    Optional<PortalUserEntity> userOpt = portalUserRepository.findByIdentifier(identifier);
    if (userOpt.isEmpty()) {
      sessionRepository.deleteById(bearerToken);
      return ApiResponse.fail("unauthorized");
    }
    return ApiResponse.success(portalUserToMeMap(userOpt.get(), identifier));
  }

  @Transactional
  public ApiResponse<Map<String, String>> updateOwnProfile(
      String bearerToken, String displayName, String nickname, String avatarUrl, String bio) {
    Optional<SessionEntity> row = resolveLivePortalSession(bearerToken);
    if (row.isEmpty()) {
      return ApiResponse.fail("unauthorized");
    }
    String identifier = row.get().getIdentifier();
    Optional<PortalUserEntity> userOpt = portalUserRepository.findByIdentifier(identifier);
    if (userOpt.isEmpty()) {
      return ApiResponse.fail("unauthorized");
    }
    PortalUserEntity u = userOpt.get();
    String err = ProfilePayloadValidator.validate(displayName, nickname, avatarUrl, bio);
    if (err != null) {
      return ApiResponse.fail(err);
    }
    ProfilePayloadValidator.applyToPortal(u, displayName, nickname, avatarUrl, bio, clock.millis());
    portalUserRepository.save(u);
    return ApiResponse.success(portalUserToMeMap(u, identifier));
  }

  @Transactional
  public ApiResponse<Void> logout(String bearerToken) {
    if (bearerToken == null || bearerToken.isBlank()) {
      return ApiResponse.fail("unauthorized");
    }
    sessionRepository.deleteById(bearerToken);
    return ApiResponse.success();
  }

  /** 未过期且 {@link SessionScope#PORTAL}；过期则删除会话行。 */
  private Optional<SessionEntity> resolveLivePortalSession(String bearerToken) {
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
    if (!SessionScope.PORTAL.name().equals(session.getScope())) {
      return Optional.empty();
    }
    return Optional.of(session);
  }

  private static Map<String, String> portalUserToMeMap(PortalUserEntity u, String identifier) {
    Map<String, String> m = new LinkedHashMap<>();
    m.put("identifier", identifier);
    m.put("displayName", nullToEmpty(u.getDisplayName()));
    m.put("nickname", nullToEmpty(u.getNickname()));
    m.put("avatarUrl", nullToEmpty(u.getAvatarUrl()));
    m.put("bio", nullToEmpty(u.getBio()));
    m.put("createdAt", Long.toString(u.getCreatedAt()));
    m.put("updatedAt", Long.toString(u.getUpdatedAt()));
    return m;
  }

  private static PortalUserEntity newPortalUser(String identifier, String passwordHash, long now) {
    PortalUserEntity user = new PortalUserEntity();
    user.setIdentifier(identifier);
    user.setPasswordHash(passwordHash);
    user.setCreatedAt(now);
    user.setDisplayName("");
    user.setNickname("");
    user.setAvatarUrl("");
    user.setBio("");
    user.setUpdatedAt(now);
    return user;
  }

  private ApiResponse<Map<String, String>> issueSmsCodeAndSend(String phone, String scene) {
    long now = clock.millis();
    Optional<SmsCodeEntity> lastOpt =
        smsCodeRepository.findFirstByPhoneAndSceneOrderByCreatedAtDesc(phone, scene);
    if (lastOpt.isPresent() && now - lastOpt.get().getCreatedAt() < SMS_SEND_COOLDOWN_MS) {
      return ApiResponse.fail("too_many_requests");
    }
    String code = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
    SmsCodeEntity e = new SmsCodeEntity();
    e.setPhone(phone);
    e.setScene(scene);
    e.setCodeHash(sha256Hex("shuziyili:" + phone + ":" + scene + ":" + code));
    e.setCreatedAt(now);
    e.setExpiresAt(now + SMS_CODE_TTL_MS);
    e.setUsed(false);
    e.setUsedAt(0);
    smsCodeRepository.save(e);
    smsSender.sendVerificationCode(phone, scene, code);
    return ApiResponse.success(Map.of("sent", "true"));
  }

  /** @return null 表示核销成功 */
  private String verifyAndConsumeSmsCode(String phone, String scene, String codeRaw) {
    String code = codeRaw == null ? "" : codeRaw.trim();
    if (!code.matches("^\\d{4,8}$")) {
      return "invalid_code";
    }
    Optional<SmsCodeEntity> lastOpt =
        smsCodeRepository.findFirstByPhoneAndSceneOrderByCreatedAtDesc(phone, scene);
    if (lastOpt.isEmpty()) {
      return "code_invalid";
    }
    SmsCodeEntity e = lastOpt.get();
    long now = clock.millis();
    if (e.isUsed()) {
      return "code_used";
    }
    if (now > e.getExpiresAt()) {
      return "code_expired";
    }
    String expected = sha256Hex("shuziyili:" + phone + ":" + scene + ":" + code);
    if (!expected.equals(e.getCodeHash())) {
      return "code_invalid";
    }
    e.setUsed(true);
    e.setUsedAt(now);
    smsCodeRepository.save(e);
    return null;
  }

  private SessionEntity issuePortalSession(String identifier) {
    SessionEntity s = new SessionEntity();
    s.setToken(UUID.randomUUID().toString().replace("-", ""));
    s.setIdentifier(identifier);
    s.setScope(SessionScope.PORTAL.name());
    s.setCreatedAt(clock.millis());
    s.setExpiresAt(s.getCreatedAt() + SESSION_TTL_MILLIS);
    return sessionRepository.save(s);
  }

  private static String nullToEmpty(String s) {
    return s == null ? "" : s;
  }

  private static String sha256Hex(String input) {
    try {
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      byte[] bytes = md.digest(input.getBytes(StandardCharsets.UTF_8));
      StringBuilder sb = new StringBuilder(bytes.length * 2);
      for (byte b : bytes) {
        sb.append(String.format("%02x", b));
      }
      return sb.toString();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
