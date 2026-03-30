package com.shuziyili.module.flashlink;

import java.time.Clock;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 快讯/文章标签：仅用于前台展示与分类筛选。 */
@Service
public class AdminFlashTagService {

  private final Clock clock = Clock.systemUTC();
  private final FlashTagRepository flashTagRepository;

  public AdminFlashTagService(FlashTagRepository flashTagRepository) {
    this.flashTagRepository = flashTagRepository;
  }

  @Transactional(readOnly = true)
  public List<FlashTagDto> list(String targetKind) {
    String kind = normalizeTargetKind(targetKind);
    return flashTagRepository.findByTargetKindOrderBySortOrderAscLabelAsc(kind).stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  @Transactional
  public UpdateResult create(AdminFlashTagController.UpsertReq req) {
    String err = validate(req, null);
    if (err != null) {
      return UpdateResult.fail(err);
    }
    long now = clock.millis();
    FlashTagEntity e = new FlashTagEntity();
    apply(e, req, now);
    flashTagRepository.save(e);
    return UpdateResult.ok(toDto(e));
  }

  @Transactional
  public UpdateResult update(Long id, AdminFlashTagController.UpsertReq req) {
    if (id == null) {
      return UpdateResult.fail("empty");
    }
    String err = validate(req, id);
    if (err != null) {
      return UpdateResult.fail(err);
    }
    Optional<FlashTagEntity> opt = flashTagRepository.findById(id);
    if (opt.isEmpty()) {
      return UpdateResult.fail("not_found");
    }
    FlashTagEntity e = opt.get();
    apply(e, req, clock.millis());
    e.setUpdatedAt(clock.millis());
    flashTagRepository.save(e);
    return UpdateResult.ok(toDto(e));
  }

  @Transactional
  public boolean delete(Long id) {
    if (id == null || !flashTagRepository.existsById(id)) {
      return false;
    }
    flashTagRepository.deleteById(id);
    return true;
  }

  private void apply(FlashTagEntity e, AdminFlashTagController.UpsertReq req, long now) {
    String kind = normalizeTargetKind(req.targetKind);
    e.setTargetKind(kind);
    e.setLabel(req.label == null ? "" : req.label.trim());
    e.setSortOrder(req.sortOrder != null ? req.sortOrder : 0);
    e.setEnabled(req.enabled == null || req.enabled);
    if (e.getCreatedAt() == 0L) e.setCreatedAt(now);
    e.setUpdatedAt(now);
  }

  private String validate(AdminFlashTagController.UpsertReq req, Long ignoreId) {
    if (req == null) {
      return "empty";
    }
    if (isBlank(req.label)) {
      return "empty_label";
    }
    if (isBlank(req.targetKind)) {
      return "invalid_target_kind";
    }
    String kind = normalizeTargetKind(req.targetKind);
    if (!"FLASH".equals(kind) && !"ARTICLE".equals(kind)) {
      return "invalid_target_kind";
    }
    // 唯一约束校验：target_kind + label
    String label = req.label.trim();
    Optional<FlashTagEntity> dup = flashTagRepository.findByTargetKindAndLabel(kind, label);
    if (dup.isPresent() && (ignoreId == null || !dup.get().getId().equals(ignoreId))) {
      return "duplicate_label";
    }
    return null;
  }

  private static String normalizeTargetKind(String raw) {
    if (raw == null || raw.trim().isEmpty()) {
      return "FLASH";
    }
    String k = raw.trim().toUpperCase();
    return "ARTICLE".equals(k) ? "ARTICLE" : "FLASH";
  }

  private static boolean isBlank(String s) {
    return s == null || s.trim().isEmpty();
  }

  private FlashTagDto toDto(FlashTagEntity e) {
    FlashTagDto d = new FlashTagDto();
    d.id = e.getId();
    d.targetKind = e.getTargetKind();
    d.label = e.getLabel();
    d.sortOrder = e.getSortOrder();
    d.enabled = e.isEnabled();
    d.createdAt = e.getCreatedAt();
    d.updatedAt = e.getUpdatedAt();
    return d;
  }

  public static class FlashTagDto {
    public Long id;
    public String targetKind;
    public String label;
    public int sortOrder;
    public boolean enabled;
    public long createdAt;
    public long updatedAt;
  }

  public static class UpdateResult {
    public boolean ok;
    public String message;
    public FlashTagDto item;

    static UpdateResult ok(FlashTagDto dto) {
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

