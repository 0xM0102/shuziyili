package com.shuziyili.module.sms;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.common.BearerTokens;
import com.shuziyili.module.auth.StaffAuthService;
import com.shuziyili.module.auth.StaffPermissionCodes;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 管理后台：验证码发送审计。若开启 {@code shuziyili.auth.store-plain-otp}，响应中含 {@code plainCode} 字段。
 */
@RestController
@RequestMapping("/api/v1/admin/verification-records")
public class AdminVerificationRecordController {

  private static final int MAX_PAGE_SIZE = 100;

  private final StaffAuthService staffAuthService;
  private final SmsCodeRepository smsCodeRepository;

  public AdminVerificationRecordController(
      StaffAuthService staffAuthService, SmsCodeRepository smsCodeRepository) {
    this.staffAuthService = staffAuthService;
    this.smsCodeRepository = smsCodeRepository;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<Map<String, Object>>> list(
      @RequestHeader(value = "Authorization", required = false) String authorization,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "50") int size) {
    String token = BearerTokens.extract(authorization);
    if (!staffAuthService.requireStaffPermission(token, StaffPermissionCodes.VERIFICATION_RECORDS_MANAGE).isOk()) {
      return ResponseEntity.ok(ApiResponse.fail("forbidden"));
    }
    int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    int safePage = Math.max(page, 0);
    Page<SmsCodeEntity> p =
        smsCodeRepository.findAllByOrderByIdDesc(PageRequest.of(safePage, safeSize));
    List<Map<String, Object>> items =
        p.getContent().stream().map(this::toRow).collect(Collectors.toList());
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("items", items);
    body.put("total", p.getTotalElements());
    body.put("page", safePage);
    body.put("size", safeSize);
    return ResponseEntity.ok(ApiResponse.success(body));
  }

  private Map<String, Object> toRow(SmsCodeEntity e) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", e.getId());
    m.put("recipient", e.getPhone());
    m.put("scene", e.getScene());
    m.put("createdAt", e.getCreatedAt());
    m.put("expiresAt", e.getExpiresAt());
    m.put("used", e.isUsed());
    m.put("usedAt", e.getUsedAt());
    m.put("plainCode", e.getPlainCode());
    return m;
  }
}
