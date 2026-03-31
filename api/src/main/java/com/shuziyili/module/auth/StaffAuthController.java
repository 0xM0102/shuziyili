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
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/** 管理后台专用登录态（与 {@code /api/v1/auth} 门户接口隔离） */
@RestController
@RequestMapping("/api/v1/staff/auth")
public class StaffAuthController {

  private final StaffAuthService staffAuthService;

  public StaffAuthController(StaffAuthService staffAuthService) {
    this.staffAuthService = staffAuthService;
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<Map<String, String>>> login(@RequestBody StaffLoginReq req) {
    if (req == null) {
      return ResponseEntity.ok(ApiResponse.fail("empty"));
    }
    ApiResponse<Map<String, String>> resp = staffAuthService.staffLogin(req.identifier, req.password);
    return ResponseEntity.ok(resp);
  }

  @GetMapping("/me")
  public ResponseEntity<ApiResponse<Map<String, String>>> me(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String token = BearerTokens.extract(authorization);
    ApiResponse<Map<String, String>> resp = staffAuthService.staffMe(token);
    return ResponseEntity.ok(resp);
  }

  @PostMapping("/logout")
  public ResponseEntity<ApiResponse<Void>> logout(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String token = BearerTokens.extract(authorization);
    ApiResponse<Void> resp = staffAuthService.staffLogout(token);
    return ResponseEntity.ok(resp);
  }

  /**
   * 当前用户修改资料（头像 URL 等；头像文件请先走 {@code POST /api/v1/admin/media/upload?scope=staff_avatar}
   * 上传 COS，再填返回的 URL）。
   *
   * <p>与门户 {@code PUT /api/v1/auth/profile} 对称，推荐使用 {@code /profile}；{@code PUT|POST /me} 仍保留兼容。
   */
  @RequestMapping(value = "/me", method = {RequestMethod.PUT, RequestMethod.POST})
  public ResponseEntity<ApiResponse<Map<String, String>>> updateMe(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody(required = false) UpdateStaffProfileReq req) {
    return doUpdateStaffOwnProfile(authorization, req);
  }

  @RequestMapping(value = "/profile", method = {RequestMethod.PUT, RequestMethod.POST})
  public ResponseEntity<ApiResponse<Map<String, String>>> updateOwnProfile(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody(required = false) UpdateStaffProfileReq req) {
    return doUpdateStaffOwnProfile(authorization, req);
  }

  private ResponseEntity<ApiResponse<Map<String, String>>> doUpdateStaffOwnProfile(
      String authorization, UpdateStaffProfileReq req) {
    String token = BearerTokens.extract(authorization);
    ApiResponse<Map<String, String>> resp =
        staffAuthService.updateStaffOwnProfile(
            token,
            req == null ? null : req.nickname,
            req == null ? null : req.avatarUrl,
            req == null ? null : req.bio);
    return ResponseEntity.ok(resp);
  }

  /** 修改当前用户登录密码。 */
  @PutMapping("/password")
  public ResponseEntity<ApiResponse<Void>> changePassword(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestBody(required = false) ChangePasswordReq req) {
    String token = BearerTokens.extract(authorization);
    String oldPw = req == null ? null : req.oldPassword;
    String newPw = req == null ? null : req.newPassword;
    ApiResponse<Void> resp = staffAuthService.changeStaffPassword(token, oldPw, newPw);
    return ResponseEntity.ok(resp);
  }

  public static class StaffLoginReq {
    public String identifier;
    public String password;
  }

  public static class UpdateStaffProfileReq {
    public String nickname;
    public String avatarUrl;
    public String bio;
  }

  public static class ChangePasswordReq {
    public String oldPassword;
    public String newPassword;
  }
}
