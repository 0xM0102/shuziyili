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

  @PostMapping("/register")
  public ResponseEntity<ApiResponse<Map<String, String>>> register(@RequestBody AuthReq req) {
    if (req == null) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    ApiResponse<Map<String, String>> resp = portalAuthService.register(req.identifier, req.password);
    return ResponseEntity.ok(resp);
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<Map<String, String>>> login(@RequestBody AuthReq req) {
    if (req == null) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    ApiResponse<Map<String, String>> resp = portalAuthService.login(req.identifier, req.password);
    return ResponseEntity.ok(resp);
  }

  @PostMapping("/sms/send")
  public ResponseEntity<ApiResponse<Map<String, String>>> sendLoginSms(@RequestBody SmsSendReq req) {
    if (req == null || req.phone == null || req.phone.trim().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    ApiResponse<Map<String, String>> resp = portalAuthService.sendLoginSmsCode(req.phone);
    return ResponseEntity.ok(resp);
  }

  @PostMapping("/sms/login")
  public ResponseEntity<ApiResponse<Map<String, String>>> smsLogin(@RequestBody SmsLoginReq req) {
    if (req == null || req.phone == null || req.phone.trim().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    if (req.code == null || req.code.trim().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("invalid_code"));
    }
    ApiResponse<Map<String, String>> resp = portalAuthService.loginBySmsCode(req.phone, req.code);
    return ResponseEntity.ok(resp);
  }

  @PostMapping("/sms/register/send")
  public ResponseEntity<ApiResponse<Map<String, String>>> sendRegisterSms(@RequestBody SmsSendReq req) {
    if (req == null || req.phone == null || req.phone.trim().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    ApiResponse<Map<String, String>> resp = portalAuthService.sendRegisterSmsCode(req.phone);
    return ResponseEntity.ok(resp);
  }

  @PostMapping("/sms/register")
  public ResponseEntity<ApiResponse<Map<String, String>>> registerBySms(@RequestBody SmsRegisterReq req) {
    if (req == null || req.phone == null || req.phone.trim().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    if (req.code == null || req.code.trim().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("invalid_code"));
    }
    ApiResponse<Map<String, String>> resp =
        portalAuthService.registerBySmsCode(req.phone, req.code, req.password);
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

  public static class SmsSendReq {
    public String phone;
  }

  public static class SmsLoginReq {
    public String phone;
    public String code;
  }

  public static class SmsRegisterReq {
    public String phone;
    public String code;
    public String password;
  }

  public static class ProfileReq {
    public String displayName;
    public String nickname;
    public String avatarUrl;
    public String bio;
  }
}
