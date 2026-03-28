package com.shuziyili.module.sms;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class LogEmailSender implements EmailSender {
  private static final Logger log = LoggerFactory.getLogger(LogEmailSender.class);

  @Override
  public boolean configured() {
    return false;
  }

  @Override
  public void sendVerificationCode(String email, String scene, String code) {
    log.info("[EMAIL DEV] scene={} email={} code={}", scene, email, code);
  }
}
