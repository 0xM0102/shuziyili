package com.shuziyili.module.home;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.module.banner.BannerEntity;
import com.shuziyili.module.banner.BannerRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/home")
public class HomeBannerController {

  private final BannerRepository bannerRepository;

  public HomeBannerController(BannerRepository bannerRepository) {
    this.bannerRepository = bannerRepository;
  }

  @GetMapping("/banners")
  public ResponseEntity<ApiResponse<Map<String, Object>>> banners() {
    List<BannerDto> items =
        bannerRepository.findAllByEnabledTrueOrderBySortOrderAscUpdatedAtDesc().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }

  private BannerDto toDto(BannerEntity e) {
    BannerDto d = new BannerDto();
    d.id = e.getId();
    d.title = e.getTitle();
    d.imageUrl = e.getImageUrl();
    d.linkUrl = e.getLinkUrl();
    d.slot = normalizeSlot(e.getSlot());
    d.sortOrder = e.getSortOrder();
    return d;
  }

  private String normalizeSlot(String slot) {
    if (slot == null || slot.trim().isEmpty()) return "home_main";
    return slot.trim().toLowerCase();
  }

  public static class BannerDto {
    public Long id;
    public String title;
    public String imageUrl;
    public String linkUrl;
    public String slot;
    public int sortOrder;
  }
}

