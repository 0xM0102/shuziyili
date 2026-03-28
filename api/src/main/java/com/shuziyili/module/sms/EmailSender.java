package com.shuziyili.module.sms;

/**
 * 邮箱验证码发送抽象；与 {@link SmsSender} 场景一致，接入 SMTP 或第三方邮件时实现。
 */
public interface EmailSender {

  boolean configured();

  /**
   * @param email 规范化后的邮箱
   * @param scene {@link SmsScene#LOGIN} 或 {@link SmsScene#REGISTER}
   * @param code 6 位数字验证码
   */
  void sendVerificationCode(String email, String scene, String code);
}
