package com.shuziyili.module.auth;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.common.BearerTokens;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
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

  public static class StaffLoginReq {
    public String identifier;
    public String password;
  }
}
