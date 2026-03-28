package com.shuziyili.module.article;

import java.time.Clock;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminArticleService {

  private final Clock clock = Clock.systemUTC();
  private final ArticleRepository articleRepository;

  public AdminArticleService(ArticleRepository articleRepository) {
    this.articleRepository = articleRepository;
  }

  @Transactional(readOnly = true)
  public List<Article> list() {
    return articleRepository.findAllByOrderByUpdatedAtDesc().stream()
        .map(this::toArticle)
        .collect(Collectors.toList());
  }

  @Transactional
  public Article create(AdminArticleController.UpsertReq req) {
    String title = req == null ? null : req.title;
    String status = req == null ? null : req.status;
    ArticleEntity a = new ArticleEntity();
    a.setId(UUID.randomUUID().toString().replace("-", ""));
    a.setTitle(title == null ? "" : title.trim());
    a.setSummary(req == null || req.summary == null ? "" : req.summary.trim());
    a.setContent(req == null || req.content == null ? "" : req.content);
    a.setCoverUrl(req == null ? null : req.coverUrl);
    a.setStatus((status == null || status.isBlank()) ? "draft" : status.trim());
    long now = clock.millis();
    a.setCreatedAt(now);
    a.setUpdatedAt(now);
    articleRepository.save(a);
    return toArticle(a);
  }

  @Transactional
  public UpdateResult update(String id, AdminArticleController.UpsertReq req) {
    if (id == null || id.isBlank()) {
      return UpdateResult.fail("empty");
    }
    Optional<ArticleEntity> opt = articleRepository.findById(id);
    if (opt.isEmpty()) {
      return UpdateResult.fail("not_found");
    }
    ArticleEntity a = opt.get();
    if (req != null) {
      if (req.title != null) a.setTitle(req.title.trim());
      if (req.summary != null) a.setSummary(req.summary.trim());
      if (req.content != null) a.setContent(req.content);
      a.setCoverUrl(req.coverUrl);
      if (req.status != null && !req.status.isBlank()) a.setStatus(req.status.trim());
    }
    a.setUpdatedAt(clock.millis());
    articleRepository.save(a);
    return UpdateResult.ok(toArticle(a));
  }

  @Transactional
  public boolean delete(String id) {
    if (id == null || id.isBlank()) return false;
    if (!articleRepository.existsById(id)) return false;
    articleRepository.deleteById(id);
    return true;
  }

  private Article toArticle(ArticleEntity e) {
    Article a = new Article();
    a.id = e.getId();
    a.title = e.getTitle();
    a.summary = e.getSummary();
    a.content = e.getContent();
    a.coverUrl = e.getCoverUrl();
    a.status = e.getStatus();
    a.createdAt = e.getCreatedAt();
    a.updatedAt = e.getUpdatedAt();
    return a;
  }

  public static class Article {
    public String id;
    public String title;
    public String summary;
    public String content;
    public String coverUrl;
    public String status;
    public long createdAt;
    public long updatedAt;
  }

  public static class UpdateResult {
    public boolean ok;
    public String message;
    public Article article;

    static UpdateResult ok(Article a) {
      UpdateResult r = new UpdateResult();
      r.ok = true;
      r.article = a;
      return r;
    }

    static UpdateResult fail(String msg) {
      UpdateResult r = new UpdateResult();
      r.ok = false;
      r.message = msg;
      return r;
    }
  }
}
