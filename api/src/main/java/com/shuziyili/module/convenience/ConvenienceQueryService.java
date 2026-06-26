package com.shuziyili.module.convenience;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConvenienceQueryService {

  private final ConvenienceCategoryRepository categoryRepository;
  private final ConvenienceServiceRepository serviceRepository;

  public ConvenienceQueryService(
      ConvenienceCategoryRepository categoryRepository,
      ConvenienceServiceRepository serviceRepository) {
    this.categoryRepository = categoryRepository;
    this.serviceRepository = serviceRepository;
  }

  @Transactional(readOnly = true)
  public PublicPayload load() {
    List<ConvenienceCategoryEntity> categories =
        categoryRepository.findAllByEnabledTrueOrderBySortOrderAscTitleAsc();
    Set<String> enabledCategorySlugs =
        categories.stream().map(ConvenienceCategoryEntity::getSlug).collect(Collectors.toSet());
    List<ConvenienceServiceEntity> services =
        serviceRepository.findAllByEnabledTrueOrderBySortOrderAscTitleAsc().stream()
            .filter(item -> enabledCategorySlugs.contains(item.getCategorySlug()))
            .collect(Collectors.toList());

    PublicPayload payload = new PublicPayload();
    payload.categories = ConvenienceMapper.toPublicCategories(categories);
    payload.services = ConvenienceMapper.toPublicServices(services);
    payload.updatedAt = System.currentTimeMillis();
    return payload;
  }

  public static class PublicPayload {
    public List<Map<String, Object>> categories;
    public List<Map<String, Object>> services;
    public long updatedAt;
  }
}
