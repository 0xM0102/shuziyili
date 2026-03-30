package com.shuziyili.module.flashlink;

import com.shuziyili.common.ApiResponse;
import java.util.Objects;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 门户「7×24 快讯」公开接口（无正文）。 */
@RestController
@RequestMapping("/api/v1/home")
public class PublicFlashLinkController {

  private final FlashLinkRepository flashLinkRepository;
  private final FlashTagRepository flashTagRepository;

  public PublicFlashLinkController(FlashLinkRepository flashLinkRepository, FlashTagRepository flashTagRepository) {
    this.flashLinkRepository = flashLinkRepository;
    this.flashTagRepository = flashTagRepository;
  }

  @GetMapping("/flash-links")
  public ResponseEntity<ApiResponse<Map<String, Object>>> list() {
    List<FlashLinkEntity> entities =
        flashLinkRepository.findTop30ByEnabledTrueOrderBySortOrderAscPublishedAtDesc();
    List<Long> tagIds =
        entities.stream().map(FlashLinkEntity::getTagId).filter(Objects::nonNull).distinct()
            .collect(Collectors.toList());
    Map<Long, String> tagLabelById = new HashMap<>();
    for (Long tagId : tagIds) {
      if (tagId == null) continue;
      tagLabelById.put(
          tagId,
          flashTagRepository.findById(tagId).map(FlashTagEntity::getLabel).orElse(""));
    }

    List<Map<String, Object>> items =
        entities.stream().map(e -> toPublic(e, tagLabelById)).collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }

  /** 单条启用快讯，供门户 /flash/[id] 使用。 */
  @GetMapping("/flash-links/{id}")
  public ResponseEntity<ApiResponse<Map<String, Object>>> getById(@PathVariable("id") Long id) {
    return findEnabled(id)
        .map(
            e -> {
              String tagLabel = "";
              Long tagId = e.getTagId();
              if (tagId != null) {
                tagLabel = flashTagRepository.findById(tagId).map(FlashTagEntity::getLabel).orElse("");
              }
              Map<Long, String> map = new LinkedHashMap<>();
              if (tagId != null) {
                map.put(tagId, tagLabel);
              }
              return ResponseEntity.ok(ApiResponse.success(toPublic(e, map)));
            })
        .orElseGet(() -> ResponseEntity.ok(ApiResponse.fail("not_found")));
  }

  private Optional<FlashLinkEntity> findEnabled(Long id) {
    if (id == null || id <= 0) {
      return Optional.empty();
    }
    return flashLinkRepository.findById(id).filter(FlashLinkEntity::isEnabled);
  }

  private Map<String, Object> toPublic(FlashLinkEntity e, Map<Long, String> tagLabelById) {
    Map<String, Object> m = new LinkedHashMap<>();
    m.put("id", e.getId());
    m.put("title", e.getTitle());
    m.put("url", e.getUrl());
    m.put("linkKind", e.getLinkKind());
    m.put("sourceLabel", e.getSourceLabel());
    m.put("tagId", e.getTagId());
    Long tagId = e.getTagId();
    m.put("tagLabel", tagId == null ? "" : tagLabelById.getOrDefault(tagId, ""));
    m.put("publishedAt", e.getPublishedAt());
    return m;
  }
}
