package com.shuziyili.module.auth;

import java.time.Clock;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 启动时引导创建初始管理员（仅在无用户时执行）。 */
@Component
public class BootstrapAdminRunner implements ApplicationRunner {

  private final StaffUserRepository staffUserRepository;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);
  private final Clock clock = Clock.systemUTC();

  public BootstrapAdminRunner(StaffUserRepository staffUserRepository) {
    this.staffUserRepository = staffUserRepository;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    if (staffUserRepository.count() > 0) {
      return;
    }

    long now = clock.millis();
    StaffUserEntity u = new StaffUserEntity();
    u.setIdentifier("mang@gansa.top");
    u.setPasswordHash(passwordEncoder.encode("Aa111111"));
    u.setRole("admin");
    u.setNickname("管理员");
    u.setAvatarUrl("");
    u.setBio("");
    u.setCreatedAt(now);
    u.setUpdatedAt(now);
    staffUserRepository.save(u);
  }
}

