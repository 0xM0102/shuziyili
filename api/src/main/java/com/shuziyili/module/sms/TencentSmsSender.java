package com.shuziyili.module.sms;

import com.tencentcloudapi.common.Credential;
import com.tencentcloudapi.common.exception.TencentCloudSDKException;
import com.tencentcloudapi.common.profile.ClientProfile;
import com.tencentcloudapi.common.profile.HttpProfile;
import com.tencentcloudapi.sms.v20210111.SmsClient;
import com.tencentcloudapi.sms.v20210111.models.SendSmsRequest;
import com.tencentcloudapi.sms.v20210111.models.SendSmsResponse;
import com.tencentcloudapi.sms.v20210111.models.SendStatus;
import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 腾讯云短信。密钥与模板 ID 仅通过环境变量 / 配置注入，勿提交仓库。
 *
 * <p>启用：{@code shuziyili.sms.enabled=true}，并设置 SecretId、SecretKey、两个模板 ID。
 */
@Component
@ConditionalOnProperty(prefix = "shuziyili.sms", name = "enabled", havingValue = "true")
public class TencentSmsSender implements SmsSender {

  private static final Logger log = LoggerFactory.getLogger(TencentSmsSender.class);

  private final String secretId;
  private final String secretKey;
  private final String sdkAppId;
  private final String signName;
  private final String templateLoginId;
  private final String templateRegisterId;
  private final String region;

  private SmsClient client;

  public TencentSmsSender(
      @Value("${shuziyili.sms.secret-id:}") String secretId,
      @Value("${shuziyili.sms.secret-key:}") String secretKey,
      @Value("${shuziyili.sms.sdk-app-id:}") String sdkAppId,
      @Value("${shuziyili.sms.sign-name:}") String signName,
      @Value("${shuziyili.sms.template-login-id:}") String templateLoginId,
      @Value("${shuziyili.sms.template-register-id:}") String templateRegisterId,
      @Value("${shuziyili.sms.region:ap-guangzhou}") String region) {
    this.secretId = secretId;
    this.secretKey = secretKey;
    this.sdkAppId = sdkAppId;
    this.signName = signName;
    this.templateLoginId = templateLoginId;
    this.templateRegisterId = templateRegisterId;
    this.region = region;
  }

  @PostConstruct
  void init() {
    if (secretId == null || secretId.isBlank()) {
      throw new IllegalStateException("shuziyili.sms.enabled=true but shuziyili.sms.secret-id is empty");
    }
    if (secretKey == null || secretKey.isBlank()) {
      throw new IllegalStateException("shuziyili.sms.enabled=true but shuziyili.sms.secret-key is empty");
    }
    if (sdkAppId == null || sdkAppId.isBlank()) {
      throw new IllegalStateException("shuziyili.sms.enabled=true but shuziyili.sms.sdk-app-id is empty");
    }
    if (signName == null || signName.isBlank()) {
      throw new IllegalStateException("shuziyili.sms.enabled=true but shuziyili.sms.sign-name is empty");
    }
    if (templateLoginId == null || templateLoginId.isBlank()) {
      throw new IllegalStateException("shuziyili.sms.enabled=true but shuziyili.sms.template-login-id is empty");
    }
    if (templateRegisterId == null || templateRegisterId.isBlank()) {
      throw new IllegalStateException("shuziyili.sms.enabled=true but shuziyili.sms.template-register-id is empty");
    }
    Credential cred = new Credential(secretId, secretKey);
    HttpProfile httpProfile = new HttpProfile();
    httpProfile.setEndpoint("sms.tencentcloudapi.com");
    ClientProfile profile = new ClientProfile();
    profile.setHttpProfile(httpProfile);
    client = new SmsClient(cred, region, profile);
  }

  @Override
  public boolean configured() {
    return true;
  }

  @Override
  public void sendVerificationCode(String phone, String scene, String code) {
    String templateId = templateForScene(scene);
    if (templateId == null) {
      log.warn("[SMS] unknown scene={}, skip send", scene);
      return;
    }
    String e164 = toE164China(phone);
    SendSmsRequest req = new SendSmsRequest();
    req.setSmsSdkAppId(sdkAppId);
    req.setSignName(signName);
    req.setTemplateId(templateId);
    req.setTemplateParamSet(new String[] {code});
    req.setPhoneNumberSet(new String[] {e164});
    try {
      SendSmsResponse resp = client.SendSms(req);
      SendStatus[] statuses = resp.getSendStatusSet();
      if (statuses == null || statuses.length == 0) {
        log.error("[SMS] empty SendStatusSet for scene={}", scene);
        return;
      }
      SendStatus st = statuses[0];
      if (!"Ok".equalsIgnoreCase(st.getCode())) {
        log.error(
            "[SMS] send failed scene={} code={} message={}",
            scene,
            st.getCode(),
            st.getMessage());
      } else {
        log.info("[SMS] sent scene={} serialNo={}", scene, st.getSerialNo());
      }
    } catch (TencentCloudSDKException e) {
      log.error("[SMS] TencentCloudSDKException scene={}: {}", scene, e.getMessage());
    }
  }

  private String templateForScene(String scene) {
    if (SmsScene.LOGIN.equals(scene)) {
      return templateLoginId;
    }
    if (SmsScene.REGISTER.equals(scene)) {
      return templateRegisterId;
    }
    return null;
  }

  /**
   * 腾讯云要求 E.164，如 +8613800138000。门户侧 identifier 可能为 138... / 86138... / +86138...
   */
  static String toE164China(String raw) {
    if (raw == null) {
      return "";
    }
    String p = raw.trim();
    if (p.startsWith("+")) {
      return p;
    }
    if (p.startsWith("86") && p.length() >= 11) {
      return "+" + p;
    }
    if (p.matches("^1\\d{10}$")) {
      return "+86" + p;
    }
    if (p.matches("^\\d{6,20}$")) {
      return "+" + p;
    }
    return p;
  }
}
