package com.shuziyili.module.flashlink;

import java.time.Clock;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 快讯 CRUD：校验标题、按 linkKind 校验 URL、写库。 */
@Service
public class AdminFlashLinkService {

  private final Clock clock = Clock.systemUTC();
  private final FlashLinkRepository flashLinkRepository;
  private final FlashTagRepository flashTagRepository;

  public AdminFlashLinkService(FlashLinkRepository flashLinkRepository, FlashTagRepository flashTagRepository) {
    this.flashLinkRepository = flashLinkRepository;
    this.flashTagRepository = flashTagRepository;
  }

  @Transactional(readOnly = true)
  public List<FlashLinkDto> list() {
    return flashLinkRepository.findAll().stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Transactional
  public UpdateResult create(AdminFlashLinkController.UpsertReq req) {
    String err = validate(req);
    if (err != null) {
      return UpdateResult.fail(err);
    }
    long now = clock.millis();
    FlashLinkEntity e = new FlashLinkEntity();
    apply(e, req, now);
    e.setCreatedAt(now);
    e.setUpdatedAt(now);
    flashLinkRepository.save(e);
    return UpdateResult.ok(toDto(e));
  }

  @Transactional
  public UpdateResult update(Long id, AdminFlashLinkController.UpsertReq req) {
    if (id == null) {
      return UpdateResult.fail("empty");
    }
    String err = validate(req);
    if (err != null) {
      return UpdateResult.fail(err);
    }
    Optional<FlashLinkEntity> opt = flashLinkRepository.findById(id);
    if (opt.isEmpty()) {
      return UpdateResult.fail("not_found");
    }
    FlashLinkEntity e = opt.get();
    long now = clock.millis();
    apply(e, req, now);
    e.setUpdatedAt(now);
    flashLinkRepository.save(e);
    return UpdateResult.ok(toDto(e));
  }

  @Transactional
  public boolean delete(Long id) {
    if (id == null || !flashLinkRepository.existsById(id)) {
      return false;
    }
    flashLinkRepository.deleteById(id);
    return true;
  }

  private void apply(FlashLinkEntity e, AdminFlashLinkController.UpsertReq req, long now) {
    e.setTitle(req.title == null ? "" : req.title.trim());
    String kind = normalizeLinkKind(req.linkKind);
    e.setLinkKind(kind);
    // INTERNAL 快讯不跳转第三方/站内文章，仅作为一句话展示；URL 永远写空字符串。
    e.setUrl("INTERNAL".equals(kind) ? "" : (req.url == null ? "" : req.url.trim()));
    String source = req.sourceLabel == null ? "" : req.sourceLabel.trim();
    if ("INTERNAL".equals(kind) && source.isEmpty()) {
      source = "数字伊犁平台";
    }
    e.setSourceLabel(source);
    e.setTagId(req.tagId);
    e.setSortOrder(req.sortOrder != null ? req.sortOrder : 0);
    e.setEnabled(req.enabled == null || req.enabled);
    e.setPublishedAt(req.publishedAt != null ? req.publishedAt : now);
  }

  private static String normalizeLinkKind(String raw) {
    if (raw == null || raw.isEmpty()) {
      return "EXTERNAL";
    }
    String k = raw.trim().toUpperCase();
    if ("INTERNAL".equals(k)) {
      return "INTERNAL";
    }
    return "EXTERNAL";
  }

  private String validate(AdminFlashLinkController.UpsertReq req) {
    if (req == null) {
      return "empty";
    }
    if (isBlank(req.title)) {
      return "empty_title";
    }
    if (hasExplicitKind(req.linkKind) && !isExplicitKindValid(req.linkKind)) {
      return "invalid_link_kind";
    }
    String kind = normalizeLinkKind(req.linkKind);

    if (req.tagId != null) {
      Optional<FlashTagEntity> t = flashTagRepository.findById(req.tagId);
      if (t.isEmpty() || !"FLASH".equalsIgnoreCase(t.get().getTargetKind())) {
        return "invalid_tag_id";
      }
    }

    if ("INTERNAL".equals(kind)) {
      // INTERNAL 快讯不需要 URL，只校验标题与类型即可。
      return null;
    }
    // EXTERNAL 外链快讯：必须 http(s) URL
    if (isBlank(req.url)) {
      return "empty_url";
    }
    String u = req.url.trim();
    return (u.startsWith("https://") || u.startsWith("http://")) ? null : "invalid_url";
  }

  private static boolean isBlank(String s) {
    return s == null || s.trim().isEmpty();
  }

  private static boolean hasExplicitKind(String raw) {
    return raw != null && !raw.trim().isEmpty();
  }

  private static boolean isExplicitKindValid(String raw) {
    String k = raw.trim().toUpperCase();
    return "EXTERNAL".equals(k) || "INTERNAL".equals(k);
  }

  private FlashLinkDto toDto(FlashLinkEntity e) {
    FlashLinkDto d = new FlashLinkDto();
    d.id = e.getId();
    d.title = e.getTitle();
    d.url = e.getUrl();
    d.linkKind = e.getLinkKind();
    d.sourceLabel = e.getSourceLabel();
    d.tagId = e.getTagId();
    d.sortOrder = e.getSortOrder();
    d.enabled = e.isEnabled();
    d.publishedAt = e.getPublishedAt();
    d.createdAt = e.getCreatedAt();
    d.updatedAt = e.getUpdatedAt();
    return d;
  }

  public static class FlashLinkDto {
    public Long id;
    public String title;
    public String url;
    public String linkKind;
    public String sourceLabel;
    public Long tagId;
    public int sortOrder;
    public boolean enabled;
    public long publishedAt;
    public long createdAt;
    public long updatedAt;
  }

  public static class UpdateResult {
    public boolean ok;
    public String message;
    public FlashLinkDto item;

    static UpdateResult ok(FlashLinkDto dto) {
      UpdateResult r = new UpdateResult();
      r.ok = true;
      r.item = dto;
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
