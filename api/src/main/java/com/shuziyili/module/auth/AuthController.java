package com.shuziyili.module.auth;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.common.BearerTokens;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 门户 C 端鉴权（仅 {@link PortalUserEntity}） */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final PortalAuthService portalAuthService;

  public AuthController(PortalAuthService portalAuthService) {
    this.portalAuthService = portalAuthService;
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<Map<String, String>>> login(@RequestBody AuthReq req) {
    if (req == null) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    ApiResponse<Map<String, String>> resp = portalAuthService.login(req.identifier, req.password);
    return ResponseEntity.ok(resp);
  }

  /** 发送注册验证码（邮箱或手机号） */
  @PostMapping("/register/send")
  public ResponseEntity<ApiResponse<Map<String, String>>> sendRegisterCode(
      @RequestBody IdentifierReq req) {
    if (req == null || req.identifier == null || req.identifier.trim().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    ApiResponse<Map<String, String>> resp = portalAuthService.sendRegisterCode(req.identifier);
    return ResponseEntity.ok(resp);
  }

  /** 验证码 + 密码完成注册 */
  @PostMapping("/register")
  public ResponseEntity<ApiResponse<Map<String, String>>> register(@RequestBody RegisterWithCodeReq req) {
    if (req == null) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    ApiResponse<Map<String, String>> resp =
        portalAuthService.registerWithCode(req.identifier, req.code, req.password);
    return ResponseEntity.ok(resp);
  }

  /** 发送登录验证码（邮箱或手机号，账号须已存在） */
  @PostMapping("/login/send")
  public ResponseEntity<ApiResponse<Map<String, String>>> sendLoginCode(@RequestBody IdentifierReq req) {
    if (req == null || req.identifier == null || req.identifier.trim().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    ApiResponse<Map<String, String>> resp = portalAuthService.sendLoginCode(req.identifier);
    return ResponseEntity.ok(resp);
  }

  /** 验证码登录 */
  @PostMapping("/login/code")
  public ResponseEntity<ApiResponse<Map<String, String>>> loginByCode(@RequestBody LoginCodeReq req) {
    if (req == null) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    ApiResponse<Map<String, String>> resp = portalAuthService.loginByCode(req.identifier, req.code);
    return ResponseEntity.ok(resp);
  }

  @GetMapping("/me")
  public ResponseEntity<ApiResponse<Map<String, String>>> me(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String token = BearerTokens.extract(authorization);
    ApiResponse<Map<String, String>> resp = portalAuthService.me(token);
    return ResponseEntity.ok(resp);
  }

  @PutMapping("/profile")
  public ResponseEntity<ApiResponse<Map<String, String>>> updateProfile(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody(required = false) ProfileReq req) {
    String token = BearerTokens.extract(authorization);
    ProfileReq body = req == null ? new ProfileReq() : req;
    ApiResponse<Map<String, String>> resp =
        portalAuthService.updateOwnProfile(token, body.displayName, body.nickname, body.avatarUrl, body.bio);
    return ResponseEntity.ok(resp);
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<Void>> logout(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String token = BearerTokens.extract(authorization);
    ApiResponse<Void> resp = portalAuthService.logout(token);
    return ResponseEntity.ok(resp);
  }

  public static class AuthReq {
    public String identifier;
    public String password;
  }

  public static class IdentifierReq {
    public String identifier;
  }

  public static class RegisterWithCodeReq {
    public String identifier;
    public String code;
    public String password;
  }

  public static class LoginCodeReq {
    public String identifier;
    public String code;
  }

  public static class ProfileReq {
    public String displayName;
    public String nickname;
    public String avatarUrl;
    public String bio;
  }
}
