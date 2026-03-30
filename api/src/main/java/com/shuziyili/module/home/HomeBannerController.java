package com.shuziyili.module.home;

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

/** 门户首页：仅返回 {@link BannerScope#HOME} 下已启用的 Banner。 */
@RestController
@RequestMapping("/api/v1/home")
public class HomeBannerController {

  private final BannerRepository bannerRepository;

  public HomeBannerController(BannerRepository bannerRepository) {
    this.bannerRepository = bannerRepository;
  }

  @GetMapping("/banners")
  public ResponseEntity<ApiResponse<Map<String, Object>>> banners() {
    List<PublicBannerDto> items =
        bannerRepository
            .findAllByScopeAndEnabledTrueOrderBySortOrderAscUpdatedAtDesc(BannerScope.HOME.code)
            .stream()
            .map(BannerPublicMapper::toPublicDto)
            .collect(Collectors.toList());
    return ResponseEntity.ok(ApiResponse.success(Map.of("items", items)));
  }
}
