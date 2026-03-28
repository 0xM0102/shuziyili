package com.shuziyili.module.sms;

/**
 * 短信发送抽象：接入腾讯云等第三方时实现本接口，在 {@code sendVerificationCode} 内按 {@code scene}
 * 选择对应模版 ID（与 {@code api/docs/sms-templates.md} 一致）。
 */
public interface SmsSender {
  /** 是否已配置真实通道（未配置时可走日志兜底） */
  boolean configured();

  /**
   * @param phone 规范化后的手机号（如 +86138xxxx）
   * @param scene {@link SmsScene#LOGIN} 或 {@link SmsScene#REGISTER}
   * @param code 6 位数字验证码
   */
  void sendVerificationCode(String phone, String scene, String code);
}

