package com.shuziyili.module.banner;

import java.time.Clock;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminBannerSeedRunner implements ApplicationRunner {

  private final Clock clock = Clock.systemUTC();
  private final BannerRepository bannerRepository;

  public AdminBannerSeedRunner(BannerRepository bannerRepository) {
    this.bannerRepository = bannerRepository;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    if (bannerRepository.count() > 0) return;

    long now = clock.millis();
    BannerEntity b = new BannerEntity();
    b.setTitle("示例 Banner（占位）");
    b.setImageUrl("https://shuziyili-1322855353.cos.ap-chengdu.myqcloud.com/uploads/demo/demo.jpg");
    b.setLinkUrl("/");
    b.setSlot(BannerSlot.HOME_MAIN.code());
    b.setEnabled(true);
    b.setSortOrder(0);
    b.setCreatedAt(now);
    b.setUpdatedAt(now);
    bannerRepository.save(b);
  }
}

