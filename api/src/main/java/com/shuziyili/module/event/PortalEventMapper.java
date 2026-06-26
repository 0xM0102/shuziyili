package com.shuziyili.module.event;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** 门户活动实体 ↔ 公开 API / 管理端 DTO 映射。 */
public final class PortalEventMapper {

  private PortalEventMapper() {}

  public static Map<String, Object> toPublicDto(PortalEventEntity e) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", e.getId());
    m.put("title", e.getTitle());
    m.put("summary", e.getSummary());
    m.put("coverUrl", nullToEmpty(e.getCoverUrl()));
    m.put("location", e.getLocation());
    m.put("category", e.getCategory());
    m.put("startsAt", Instant.ofEpochMilli(e.getStartsAt()).toString());
    m.put("endsAt", Instant.ofEpochMilli(e.getEndsAt()).toString());
    m.put("organizer", e.getOrganizer());
    String registerUrl = e.getRegisterUrl();
    if (registerUrl != null && !registerUrl.isBlank()) {
      m.put("registerUrl", registerUrl.trim());
    }
    m.put("highlights", EventHighlightsJson.decode(e.getHighlightsJson()));
    return m;
  }

  public static List<Map<String, Object>> toPublicDtos(List<PortalEventEntity> items) {
    return items.stream().map(PortalEventMapper::toPublicDto).collect(Collectors.toList());
  }

  public static AdminEventService.EventDto toAdminDto(PortalEventEntity e) {
    AdminEventService.EventDto d = new AdminEventService.EventDto();
    d.id = e.getId();
    d.title = e.getTitle();
    d.summary = e.getSummary();
    d.coverUrl = e.getCoverUrl();
    d.location = e.getLocation();
    d.category = e.getCategory();
    d.startsAt = e.getStartsAt();
    d.endsAt = e.getEndsAt();
    d.organizer = e.getOrganizer();
    d.registerUrl = e.getRegisterUrl();
    d.highlights = EventHighlightsJson.decode(e.getHighlightsJson());
    d.published = e.isPublished();
    d.sortOrder = e.getSortOrder();
    d.createdAt = e.getCreatedAt();
    d.updatedAt = e.getUpdatedAt();
    return d;
  }

  private static String nullToEmpty(String s) {
    return s == null ? "" : s;
  }
}
