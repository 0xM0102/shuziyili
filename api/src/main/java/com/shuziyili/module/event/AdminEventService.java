package com.shuziyili.module.event;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminEventService {

  private static final Pattern SLUG = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");

  private final PortalEventRepository repository;

  public AdminEventService(PortalEventRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public List<EventDto> listAll() {
    return repository.findAllByOrderBySortOrderAscStartsAtDesc().stream()
        .map(PortalEventMapper::toAdminDto)
        .collect(Collectors.toList());
  }

  @Transactional
  public CreateResult create(UpsertReq req, long nowMs) {
    String err = validateUpsert(req, true);
    if (err != null) {
      return CreateResult.fail(err);
    }
    String id = req.id.trim();
    if (repository.existsById(id)) {
      return CreateResult.fail("already_exists");
    }
    PortalEventEntity e = new PortalEventEntity();
    e.setId(id);
    applyUpsert(e, req, nowMs, true);
    repository.save(e);
    return CreateResult.ok(PortalEventMapper.toAdminDto(e));
  }

  @Transactional
  public UpdateResult update(String id, UpsertReq req, long nowMs) {
    Optional<PortalEventEntity> opt = repository.findById(id);
    if (opt.isEmpty()) {
      return UpdateResult.fail("not_found");
    }
    String err = validateUpsert(req, false);
    if (err != null) {
      return UpdateResult.fail(err);
    }
    PortalEventEntity e = opt.get();
    applyUpsert(e, req, nowMs, false);
    repository.save(e);
    return UpdateResult.ok(PortalEventMapper.toAdminDto(e));
  }

  @Transactional
  public boolean delete(String id) {
    if (!repository.existsById(id)) {
      return false;
    }
    repository.deleteById(id);
    return true;
  }

  private void applyUpsert(PortalEventEntity e, UpsertReq req, long nowMs, boolean creating) {
    e.setTitle(req.title.trim());
    e.setSummary(trimOrEmpty(req.summary));
    e.setCoverUrl(trimOrEmpty(req.coverUrl));
    e.setLocation(trimOrEmpty(req.location));
    e.setCategory(req.category.trim());
    e.setStartsAt(req.startsAt);
    e.setEndsAt(req.endsAt);
    e.setOrganizer(trimOrEmpty(req.organizer));
    e.setRegisterUrl(normalizeRegisterUrl(req.registerUrl));
    List<String> highlights =
        req.highlights != null && !req.highlights.isEmpty()
            ? req.highlights
            : EventHighlightsJson.fromMultilineText(req.highlightsText);
    e.setHighlightsJson(EventHighlightsJson.encode(highlights));
    e.setPublished(req.published == null || req.published);
    e.setSortOrder(req.sortOrder == null ? 0 : req.sortOrder);
    if (creating) {
      e.setCreatedAt(nowMs);
    }
    e.setUpdatedAt(nowMs);
  }

  private static String validateUpsert(UpsertReq req, boolean creating) {
    if (req == null) {
      return "empty";
    }
    if (creating) {
      if (req.id == null || req.id.isBlank() || !SLUG.matcher(req.id.trim()).matches()) {
        return "invalid_id";
      }
    }
    if (req.title == null || req.title.isBlank()) {
      return "empty_title";
    }
    if (req.category == null || !EventCategory.isValid(req.category.trim())) {
      return "invalid_category";
    }
    if (req.startsAt <= 0 || req.endsAt <= 0 || req.endsAt < req.startsAt) {
      return "invalid_time_range";
    }
    String registerUrlErr = validateRegisterUrl(req.registerUrl);
    if (registerUrlErr != null) {
      return registerUrlErr;
    }
    return null;
  }

  /** 可选；非空时必须为 http(s) 外链，避免门户详情页 XSS。 */
  private static String validateRegisterUrl(String raw) {
    if (raw == null || raw.isBlank()) {
      return null;
    }
    String u = raw.trim();
    return (u.startsWith("https://") || u.startsWith("http://")) ? null : "invalid_register_url";
  }

  private static String trimOrEmpty(String s) {
    return s == null ? "" : s.trim();
  }

  private static String blankToNull(String s) {
    if (s == null) {
      return null;
    }
    String t = s.trim();
    return t.isEmpty() ? null : t;
  }

  private static String normalizeRegisterUrl(String s) {
    String t = blankToNull(s);
    return t == null ? null : t.trim();
  }

  public static class EventDto {
    public String id;
    public String title;
    public String summary;
    public String coverUrl;
    public String location;
    public String category;
    public long startsAt;
    public long endsAt;
    public String organizer;
    public String registerUrl;
    public List<String> highlights;
    public boolean published;
    public int sortOrder;
    public long createdAt;
    public long updatedAt;
  }

  public static class UpsertReq {
    public String id;
    public String title;
    public String summary;
    public String coverUrl;
    public String location;
    public String category;
    public long startsAt;
    public long endsAt;
    public String organizer;
    public String registerUrl;
    public List<String> highlights;
    /** 管理端表单：每行一条亮点 */
    public String highlightsText;
    public Boolean published;
    public Integer sortOrder;
  }

  public static final class CreateResult {
    public final boolean ok;
    public final String message;
    public final EventDto item;

    private CreateResult(boolean ok, String message, EventDto item) {
      this.ok = ok;
      this.message = message;
      this.item = item;
    }

    static CreateResult ok(EventDto item) {
      return new CreateResult(true, null, item);
    }

    static CreateResult fail(String message) {
      return new CreateResult(false, message, null);
    }
  }

  public static final class UpdateResult {
    public final boolean ok;
    public final String message;
    public final EventDto item;

    private UpdateResult(boolean ok, String message, EventDto item) {
      this.ok = ok;
      this.message = message;
      this.item = item;
    }

    static UpdateResult ok(EventDto item) {
      return new UpdateResult(true, null, item);
    }

    static UpdateResult fail(String message) {
      return new UpdateResult(false, message, null);
    }
  }
}
