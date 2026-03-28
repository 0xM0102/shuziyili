package com.shuziyili.module.article;

import java.time.Clock;
import java.util.UUID;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** 首次启动时写入示例文章，便于后台联调。 */
@Component
public class AdminArticleSeedRunner implements ApplicationRunner {

  private final ArticleRepository articleRepository;
  private final Clock clock = Clock.systemUTC();

  public AdminArticleSeedRunner(ArticleRepository articleRepository) {
    this.articleRepository = articleRepository;
  }

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    if (articleRepository.count() > 0) {
      return;
    }
    seed("示例资讯 1（占位）", "draft");
    seed("示例资讯 2（占位）", "published");
  }

  private void seed(String title, String status) {
    ArticleEntity a = new ArticleEntity();
    a.setId(UUID.randomUUID().toString().replace("-", ""));
    a.setTitle(title);
    a.setSummary("用于后台联调的占位内容。");
    a.setContent("占位内容（后续在管理后台编辑真实正文）。");
    a.setStatus(status);
    long now = clock.millis();
    a.setCreatedAt(now);
    a.setUpdatedAt(now);
    articleRepository.save(a);
  }
}
