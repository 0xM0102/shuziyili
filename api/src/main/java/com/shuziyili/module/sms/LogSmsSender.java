package com.shuziyili.module.sms;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
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

