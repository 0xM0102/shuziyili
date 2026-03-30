package com.shuziyili.module.travel;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.module.banner.BannerPublicMapper;
import com.shuziyili.module.banner.BannerRepository;
import com.shuziyili.module.banner.BannerScope;
import com.shuziyili.module.banner.PublicBannerDto;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 旅游频道：与首页共用 banners 表，仅返回 {@link BannerScope#TRAVEL}。 */
@RestController
@RequestMapping("/api/v1/travel")
public class TravelBannerController {

  private final BannerRepository bannerRepository;

  public TravelBannerController(BannerRepository bannerRepository) {
    this.bannerRepository = bannerRepository;
  }

  @GetMapping("/banners")
  public ResponseEntity<ApiResponse<Map<String, Object>>> banners() {
    List<PublicBannerDto> items =
        bannerRepository
            .findAllByScopeAndEnabledTrueOrderBySortOrderAscUpdatedAtDesc(BannerScope.TRAVEL.code)
            .stream()
            .map(BannerPublicMapper::toPublicDto)
            .collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }
}
