package com.shuziyili.module.event;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class PortalEventQueryService {

  private final PortalEventRepository repository;

  public PortalEventQueryService(PortalEventRepository repository) {
    this.repository = repository;
  }

  public List<PortalEventEntity> listPublished(String status, String category, long nowMs) {
    List<PortalEventEntity> all = repository.findAllByPublishedTrueOrderBySortOrderAscStartsAtDesc();
    return filter(all, status, category, nowMs);
  }

  public Optional<PortalEventEntity> findPublishedById(String id) {
    return repository.findById(id).filter(PortalEventEntity::isPublished);
  }

  static List<PortalEventEntity> filter(
      List<PortalEventEntity> items, String status, String category, long nowMs) {
    String st = normalizeStatus(status);
    String cat = normalizeCategory(category);
    return items.stream()
        .filter(e -> cat == null || cat.equals(e.getCategory()))
        .filter(e -> st == null || st.equals(computeStatus(nowMs, e.getStartsAt(), e.getEndsAt())))
        .collect(Collectors.toList());
  }

  static String computeStatus(long nowMs, long startsAt, long endsAt) {
    if (nowMs < startsAt) {
      return "upcoming";
    }
    if (nowMs > endsAt) {
      return "ended";
    }
    return "ongoing";
  }

  private static String normalizeStatus(String raw) {
    if (raw == null || raw.isBlank() || "all".equalsIgnoreCase(raw.trim())) {
      return null;
    }
    String s = raw.trim().toLowerCase(Locale.ROOT);
    if ("ongoing".equals(s) || "upcoming".equals(s) || "ended".equals(s)) {
      return s;
    }
    return null;
  }

  private static String normalizeCategory(String raw) {
    if (raw == null || raw.isBlank() || "all".equalsIgnoreCase(raw.trim())) {
      return null;
    }
    String c = raw.trim();
    return EventCategory.isValid(c) ? c : null;
  }
}
