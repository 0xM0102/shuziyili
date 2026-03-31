package com.shuziyili.module.home;

import com.shuziyili.module.article.ArticleEntity;
import com.shuziyili.module.article.ArticleRepository;
import java.time.Clock;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HomeCurationService {

  public static final String SECTION_FEATURED = "featured";

  private final Clock clock = Clock.systemUTC();
  private final HomeArticleSlotRepository slotRepository;
  private final ArticleRepository articleRepository;

  public HomeCurationService(
      HomeArticleSlotRepository slotRepository, ArticleRepository articleRepository) {
    this.slotRepository = slotRepository;
    this.articleRepository = articleRepository;
  }

  /** 后台列表：按顺序返回；自动清理指向已删文章的槽位 */
  @Transactional
  public List<AdminSlotRow> listAdminFeaturedSlots() {
    List<HomeArticleSlotEntity> rows =
        slotRepository.findAllBySectionOrderBySortOrderAsc(SECTION_FEATURED);
    List<AdminSlotRow> out = new ArrayList<>();
    List<Long> orphanIds = new ArrayList<>();
    for (HomeArticleSlotEntity row : rows) {
      String articleId = row.getArticleId();
      if (articleId == null || articleId.isBlank()) {
        orphanIds.add(row.getId());
        continue;
      }
      Optional<ArticleEntity> opt = articleRepository.findById(articleId);
      if (opt.isEmpty()) {
        orphanIds.add(row.getId());
        continue;
      }
      ArticleEntity a = opt.get();
      AdminSlotRow r = new AdminSlotRow();
      r.slotId = row.getId();
      r.articleId = a.getId();
      r.title = a.getTitle();
      r.status = a.getStatus();
      r.sortOrder = row.getSortOrder();
      out.add(r);
    }
    if (!orphanIds.isEmpty()) {
      slotRepository.deleteAllById(orphanIds);
    }
    return out;
  }

  @Transactional
  public void replaceFeatured(List<String> articleIdsRaw) {
    LinkedHashSet<String> unique = new LinkedHashSet<>();
    if (articleIdsRaw != null) {
      for (String raw : articleIdsRaw) {
        if (raw == null) continue;
        String t = raw.trim();
        if (!t.isEmpty()) unique.add(t);
      }
    }
    List<String> ids = new ArrayList<>(unique);
    for (String id : ids) {
      if (id == null || id.isBlank() || !articleRepository.existsById(id)) {
        throw new IllegalArgumentException("article_not_found");
      }
    }
    slotRepository.deleteBySection(SECTION_FEATURED);
    long now = clock.millis();
    int order = 0;
    List<HomeArticleSlotEntity> batch = new ArrayList<>();
    for (String id : ids) {
      HomeArticleSlotEntity e = new HomeArticleSlotEntity();
      e.setSection(SECTION_FEATURED);
      e.setArticleId(id);
      e.setSortOrder(order++);
      e.setCreatedAt(now);
      e.setUpdatedAt(now);
      batch.add(e);
    }
    slotRepository.saveAll(batch);
  }

  /** 门户首页：仅已发布文章（精选）。 */
  @Transactional(readOnly = true)
  public Map<String, Object> publicCurated() {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("featured", buildPublicSection(SECTION_FEATURED));
    return m;
  }

  private List<Map<String, Object>> buildPublicSection(String sectionNorm) {
    List<HomeArticleSlotEntity> rows = slotRepository.findAllBySectionOrderBySortOrderAsc(sectionNorm);
    List<Map<String, Object>> out = new ArrayList<>();
    for (HomeArticleSlotEntity row : rows) {
      articleRepository
          .findByIdAndStatus(row.getArticleId(), "published")
          .ifPresent(a -> out.add(toPublicItem(a)));
    }
    return out;
  }

  private static Map<String, Object> toPublicItem(ArticleEntity a) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", a.getId());
    m.put("title", a.getTitle());
    m.put("summary", a.getSummary() == null ? "" : a.getSummary());
    m.put("coverUrl", a.getCoverUrl());
    m.put("updatedAt", a.getUpdatedAt());
    m.put("href", "/a/" + a.getId());
    return m;
  }

  public static class AdminSlotRow {
    public Long slotId;
    public String articleId;
    public String title;
    public String status;
    public int sortOrder;

    /** 管理端 GET /admin/home-articles 单条 `items[]` 结构。 */
    public Map<String, Object> toAdminItemMap() {
      Map<String, Object> m = new LinkedHashMap<>();
      m.put("slotId", slotId);
      m.put("articleId", articleId);
      m.put("title", title);
      m.put("status", status);
      m.put("sortOrder", sortOrder);
      return m;
    }
  }
}
