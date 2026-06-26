package com.shuziyili.module.auth;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.common.BearerTokens;
import com.shuziyili.common.RequestOriginSupport;
import com.shuziyili.module.media.CosStorageService;
import com.shuziyili.module.media.CosStorageService.UploadResult;
import com.shuziyili.module.media.CosUploadScope;
import javax.servlet.http.HttpServletRequest;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** 门户 C 端鉴权（仅 {@link PortalUserEntity}） */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

  private final PortalAuthService portalAuthService;
  private final CosStorageService cosStorageService;

  public AuthController(PortalAuthService portalAuthService, CosStorageService cosStorageService) {
    this.portalAuthService = portalAuthService;
    this.cosStorageService = cosStorageService;
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
      @RequestBody IdentifierReq req, HttpServletRequest httpRequest) {
    if (req == null || req.identifier == null || req.identifier.trim().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    ApiResponse<Map<String, String>> resp =
        portalAuthService.sendRegisterCode(req.identifier, RequestOriginSupport.resolve(httpRequest));
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
  public ResponseEntity<ApiResponse<Map<String, String>>> sendLoginCode(
      @RequestBody IdentifierReq req, HttpServletRequest httpRequest) {
    if (req == null || req.identifier == null || req.identifier.trim().isEmpty()) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    ApiResponse<Map<String, String>> resp =
        portalAuthService.sendLoginCode(req.identifier, RequestOriginSupport.resolve(httpRequest));
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
        portalAuthService.updateOwnProfile(token, body.nickname, body.avatarUrl, body.bio);
    return ResponseEntity.ok(resp);
  }

  /** 门户用户头像上传（需登录；对象写入 COS {@code uploads/.../portal/avatars/}）。 */
  @PostMapping(value = "/media/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ApiResponse<UploadResult>> uploadAvatar(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestParam("file") MultipartFile file) {
    String token = BearerTokens.extract(authorization);
    if (!portalAuthService.isPortalSessionValid(token)) {
      return ResponseEntity.ok(ApiResponse.fail("unauthorized"));
    }
    try {
      return ResponseEntity.ok(
          ApiResponse.success(cosStorageService.upload(file, CosUploadScope.PORTAL_AVATAR)));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.ok(ApiResponse.fail(e.getMessage()));
    } catch (IllegalStateException e) {
      return ResponseEntity.ok(ApiResponse.fail(e.getMessage()));
    }
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
    public String nickname;
    public String avatarUrl;
    public String bio;
  }
}
