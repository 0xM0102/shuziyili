package com.shuziyili.module.convenience;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminConvenienceService {

  private static final Pattern SLUG = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");

  private final ConvenienceCategoryRepository categoryRepository;
  private final ConvenienceServiceRepository serviceRepository;

  public AdminConvenienceService(
      ConvenienceCategoryRepository categoryRepository,
      ConvenienceServiceRepository serviceRepository) {
    this.categoryRepository = categoryRepository;
    this.serviceRepository = serviceRepository;
  }

  @Transactional(readOnly = true)
  public List<CategoryDto> listCategories() {
    return categoryRepository.findAllByOrderBySortOrderAscTitleAsc().stream()
        .map(ConvenienceMapper::toCategoryDto)
        .collect(Collectors.toList());
  }

  @Transactional(readOnly = true)
  public List<ServiceDto> listServices() {
    return serviceRepository.findAllByOrderBySortOrderAscTitleAsc().stream()
        .map(ConvenienceMapper::toServiceDto)
        .collect(Collectors.toList());
  }

  @Transactional
  public CategoryResult createCategory(CategoryUpsertReq req, long nowMs) {
    String err = validateCategory(req, true);
    if (err != null) {
      return CategoryResult.fail(err);
    }
    String slug = req.slug.trim();
    if (categoryRepository.existsById(slug)) {
      return CategoryResult.fail("already_exists");
    }
    ConvenienceCategoryEntity e = new ConvenienceCategoryEntity();
    e.setSlug(slug);
    applyCategoryUpsert(e, req, nowMs, true);
    categoryRepository.save(e);
    return CategoryResult.ok(ConvenienceMapper.toCategoryDto(e));
  }

  @Transactional
  public CategoryResult updateCategory(String slug, CategoryUpsertReq req, long nowMs) {
    Optional<ConvenienceCategoryEntity> opt = categoryRepository.findById(slug);
    if (opt.isEmpty()) {
      return CategoryResult.fail("not_found");
    }
    String err = validateCategory(req, false);
    if (err != null) {
      return CategoryResult.fail(err);
    }
    ConvenienceCategoryEntity e = opt.get();
    applyCategoryUpsert(e, req, nowMs, false);
    categoryRepository.save(e);
    return CategoryResult.ok(ConvenienceMapper.toCategoryDto(e));
  }

  @Transactional
  public DeleteResult deleteCategory(String slug) {
    if (!categoryRepository.existsById(slug)) {
      return DeleteResult.fail("not_found");
    }
    if (serviceRepository.countByCategorySlug(slug) > 0) {
      return DeleteResult.fail("category_has_services");
    }
    categoryRepository.deleteById(slug);
    return DeleteResult.ok();
  }

  @Transactional
  public ServiceResult createService(ServiceUpsertReq req, long nowMs) {
    String err = validateService(req, true);
    if (err != null) {
      return ServiceResult.fail(err);
    }
    String id = req.id.trim();
    if (serviceRepository.existsById(id)) {
      return ServiceResult.fail("already_exists");
    }
    ConvenienceServiceEntity e = new ConvenienceServiceEntity();
    e.setId(id);
    applyServiceUpsert(e, req, nowMs, true);
    serviceRepository.save(e);
    return ServiceResult.ok(ConvenienceMapper.toServiceDto(e));
  }

  @Transactional
  public ServiceResult updateService(String id, ServiceUpsertReq req, long nowMs) {
    Optional<ConvenienceServiceEntity> opt = serviceRepository.findById(id);
    if (opt.isEmpty()) {
      return ServiceResult.fail("not_found");
    }
    String err = validateService(req, false);
    if (err != null) {
      return ServiceResult.fail(err);
    }
    ConvenienceServiceEntity e = opt.get();
    applyServiceUpsert(e, req, nowMs, false);
    serviceRepository.save(e);
    return ServiceResult.ok(ConvenienceMapper.toServiceDto(e));
  }

  @Transactional
  public boolean deleteService(String id) {
    if (!serviceRepository.existsById(id)) {
      return false;
    }
    serviceRepository.deleteById(id);
    return true;
  }

  private void applyCategoryUpsert(
      ConvenienceCategoryEntity e, CategoryUpsertReq req, long nowMs, boolean creating) {
    e.setTitle(req.title.trim());
    e.setShortTitle(trimOrDefault(req.shortTitle, req.title.trim()));
    e.setDescription(trimOrEmpty(req.description));
    e.setIcon(trimOrDefault(req.icon, "convenience"));
    List<String> keywords =
        req.keywords != null && !req.keywords.isEmpty()
            ? req.keywords
            : ConvenienceStringListJson.fromMultilineText(req.keywordsText);
    e.setKeywordsJson(ConvenienceStringListJson.encode(keywords));
    e.setEnabled(req.enabled == null || req.enabled);
    e.setSortOrder(req.sortOrder == null ? 0 : req.sortOrder);
    if (creating) {
      e.setCreatedAt(nowMs);
    }
    e.setUpdatedAt(nowMs);
  }

  private void applyServiceUpsert(
      ConvenienceServiceEntity e, ServiceUpsertReq req, long nowMs, boolean creating) {
    e.setCategorySlug(req.category.trim());
    e.setTitle(req.title.trim());
    e.setArea(trimOrEmpty(req.area));
    e.setAddress(trimOrEmpty(req.address));
    e.setContact(trimOrEmpty(req.contact));
    e.setHours(trimOrEmpty(req.hours));
    e.setSummary(trimOrEmpty(req.summary));
    List<String> tags =
        req.tags != null && !req.tags.isEmpty()
            ? req.tags
            : ConvenienceStringListJson.fromMultilineText(req.tagsText);
    e.setTagsJson(ConvenienceStringListJson.encode(tags));
    e.setStatus(req.status.trim());
    e.setSourceUrl(blankToNull(req.sourceUrl));
    e.setMapUrl(blankToNull(req.mapUrl));
    e.setEmergency(req.emergency != null && req.emergency);
    e.setEnabled(req.enabled == null || req.enabled);
    e.setSortOrder(req.sortOrder == null ? 0 : req.sortOrder);
    if (creating) {
      e.setCreatedAt(nowMs);
    }
    e.setUpdatedAt(nowMs);
  }

  private String validateCategory(CategoryUpsertReq req, boolean creating) {
    if (req == null) {
      return "empty";
    }
    if (creating && (req.slug == null || req.slug.isBlank() || !SLUG.matcher(req.slug.trim()).matches())) {
      return "invalid_slug";
    }
    if (req.title == null || req.title.isBlank()) {
      return "empty_title";
    }
    return null;
  }

  private String validateService(ServiceUpsertReq req, boolean creating) {
    if (req == null) {
      return "empty";
    }
    if (creating && (req.id == null || req.id.isBlank() || !SLUG.matcher(req.id.trim()).matches())) {
      return "invalid_id";
    }
    if (req.category == null || req.category.isBlank() || !categoryRepository.existsById(req.category.trim())) {
      return "invalid_category";
    }
    if (req.title == null || req.title.isBlank()) {
      return "empty_title";
    }
    if (req.status == null || !ConvenienceServiceStatus.isValid(req.status.trim())) {
      return "invalid_status";
    }
    String sourceErr = validateOptionalUrl(req.sourceUrl, "invalid_source_url");
    if (sourceErr != null) {
      return sourceErr;
    }
    return validateOptionalUrl(req.mapUrl, "invalid_map_url");
  }

  private static String validateOptionalUrl(String raw, String errorCode) {
    if (raw == null || raw.isBlank()) {
      return null;
    }
    String u = raw.trim();
    return (u.startsWith("https://") || u.startsWith("http://")) ? null : errorCode;
  }

  private static String trimOrEmpty(String s) {
    return s == null ? "" : s.trim();
  }

  private static String trimOrDefault(String s, String fallback) {
    String t = trimOrEmpty(s);
    return t.isEmpty() ? fallback : t;
  }

  private static String blankToNull(String s) {
    String t = trimOrEmpty(s);
    return t.isEmpty() ? null : t;
  }

  public static class CategoryDto {
    public String slug;
    public String title;
    public String shortTitle;
    public String description;
    public String icon;
    public List<String> keywords;
    public boolean enabled;
    public int sortOrder;
    public long createdAt;
    public long updatedAt;
  }

  public static class ServiceDto {
    public String id;
    public String category;
    public String title;
    public String area;
    public String address;
    public String contact;
    public String hours;
    public String summary;
    public List<String> tags;
    public String status;
    public String sourceUrl;
    public String mapUrl;
    public boolean emergency;
    public boolean enabled;
    public int sortOrder;
    public long createdAt;
    public long updatedAt;
  }

  public static class CategoryUpsertReq {
    public String slug;
    public String title;
    public String shortTitle;
    public String description;
    public String icon;
    public List<String> keywords;
    public String keywordsText;
    public Boolean enabled;
    public Integer sortOrder;
  }

  public static class ServiceUpsertReq {
    public String id;
    public String category;
    public String title;
    public String area;
    public String address;
    public String contact;
    public String hours;
    public String summary;
    public List<String> tags;
    public String tagsText;
    public String status;
    public String sourceUrl;
    public String mapUrl;
    public Boolean emergency;
    public Boolean enabled;
    public Integer sortOrder;
  }

  public static final class CategoryResult {
    public final boolean ok;
    public final String message;
    public final CategoryDto item;

    private CategoryResult(boolean ok, String message, CategoryDto item) {
      this.ok = ok;
      this.message = message;
      this.item = item;
    }

    static CategoryResult ok(CategoryDto item) {
      return new CategoryResult(true, null, item);
    }

    static CategoryResult fail(String message) {
      return new CategoryResult(false, message, null);
    }
  }

  public static final class ServiceResult {
    public final boolean ok;
    public final String message;
    public final ServiceDto item;

    private ServiceResult(boolean ok, String message, ServiceDto item) {
      this.ok = ok;
      this.message = message;
      this.item = item;
    }

    static ServiceResult ok(ServiceDto item) {
      return new ServiceResult(true, null, item);
    }

    static ServiceResult fail(String message) {
      return new ServiceResult(false, message, null);
    }
  }

  public static final class DeleteResult {
    public final boolean ok;
    public final String message;

    private DeleteResult(boolean ok, String message) {
      this.ok = ok;
      this.message = message;
    }

    static DeleteResult ok() {
      return new DeleteResult(true, null);
    }

    static DeleteResult fail(String message) {
      return new DeleteResult(false, message);
    }
  }
}
