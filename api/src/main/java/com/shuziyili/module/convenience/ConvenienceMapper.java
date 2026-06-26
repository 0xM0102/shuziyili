package com.shuziyili.module.convenience;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class ConvenienceMapper {

  private ConvenienceMapper() {}

  public static AdminConvenienceService.CategoryDto toCategoryDto(ConvenienceCategoryEntity e) {
    AdminConvenienceService.CategoryDto d = new AdminConvenienceService.CategoryDto();
    d.slug = e.getSlug();
    d.title = e.getTitle();
    d.shortTitle = e.getShortTitle();
    d.description = e.getDescription();
    d.icon = e.getIcon();
    d.keywords = ConvenienceStringListJson.decode(e.getKeywordsJson());
    d.enabled = e.isEnabled();
    d.sortOrder = e.getSortOrder();
    d.createdAt = e.getCreatedAt();
    d.updatedAt = e.getUpdatedAt();
    return d;
  }

  public static AdminConvenienceService.ServiceDto toServiceDto(ConvenienceServiceEntity e) {
    AdminConvenienceService.ServiceDto d = new AdminConvenienceService.ServiceDto();
    d.id = e.getId();
    d.category = e.getCategorySlug();
    d.title = e.getTitle();
    d.area = e.getArea();
    d.address = e.getAddress();
    d.contact = e.getContact();
    d.hours = e.getHours();
    d.summary = e.getSummary();
    d.tags = ConvenienceStringListJson.decode(e.getTagsJson());
    d.status = e.getStatus();
    d.sourceUrl = e.getSourceUrl();
    d.mapUrl = e.getMapUrl();
    d.emergency = e.isEmergency();
    d.enabled = e.isEnabled();
    d.sortOrder = e.getSortOrder();
    d.createdAt = e.getCreatedAt();
    d.updatedAt = e.getUpdatedAt();
    return d;
  }

  public static Map<String, Object> toPublicCategory(ConvenienceCategoryEntity e) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("slug", e.getSlug());
    m.put("title", e.getTitle());
    m.put("shortTitle", e.getShortTitle());
    m.put("description", e.getDescription());
    m.put("icon", e.getIcon());
    m.put("keywords", ConvenienceStringListJson.decode(e.getKeywordsJson()));
    return m;
  }

  public static Map<String, Object> toPublicService(ConvenienceServiceEntity e) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", e.getId());
    m.put("title", e.getTitle());
    m.put("category", e.getCategorySlug());
    m.put("area", e.getArea());
    m.put("address", e.getAddress());
    m.put("contact", e.getContact());
    m.put("hours", e.getHours());
    m.put("summary", e.getSummary());
    m.put("tags", ConvenienceStringListJson.decode(e.getTagsJson()));
    m.put("status", e.getStatus());
    m.put("emergency", e.isEmergency());
    putNonBlank(m, "sourceUrl", e.getSourceUrl());
    putNonBlank(m, "mapUrl", e.getMapUrl());
    return m;
  }

  public static List<Map<String, Object>> toPublicCategories(List<ConvenienceCategoryEntity> items) {
    return items.stream().map(ConvenienceMapper::toPublicCategory).collect(Collectors.toList());
  }

  public static List<Map<String, Object>> toPublicServices(List<ConvenienceServiceEntity> items) {
    return items.stream().map(ConvenienceMapper::toPublicService).collect(Collectors.toList());
  }

  private static void putNonBlank(Map<String, Object> m, String key, String value) {
    if (value != null && !value.isBlank()) {
      m.put(key, value.trim());
    }
  }
}
