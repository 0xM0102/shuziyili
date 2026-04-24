package com.shuziyili.module.sms;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** 未启用腾讯云短信时：仅打日志，便于本地联调。 */
@Component
@ConditionalOnProperty(prefix = "shuziyili.sms", name = "enabled", havingValue = "false", matchIfMissing = true)
public class LogSmsSender implements SmsSender {
  private static final Logger log = LoggerFactory.getLogger(LogSmsSender.class);

  @Override
  public boolean configured() {
    return false;
  }

  @Override
  public void sendVerificationCode(String phone, String scene, String code) {
    log.info("[SMS DEV] scene={} phone={} code={}", scene, phone, code);
  }
}

