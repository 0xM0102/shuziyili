package com.shuziyili.module.system;

import com.shuziyili.common.ApiResponse;
import com.shuziyili.module.article.ArticleRepository;
import com.shuziyili.module.auth.PortalUserRepository;
import com.shuziyili.module.auth.StaffPermissionCodes;
import com.shuziyili.module.auth.StaffUserRepository;
import com.shuziyili.module.auth.StaffAuthService;
import com.shuziyili.module.banner.BannerRepository;
import com.shuziyili.module.flashlink.FlashLinkRepository;
import com.shuziyili.module.flashlink.FlashTagRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 仪表盘汇总数据：计数类指标，供后台首页展示。 */
@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class AdminDashboardController {

  private final StaffAuthService staffAuthService;
  private final PortalUserRepository portalUserRepository;
  private final StaffUserRepository staffUserRepository;
  private final ArticleRepository articleRepository;
  private final FlashLinkRepository flashLinkRepository;
  private final FlashTagRepository flashTagRepository;
  private final BannerRepository bannerRepository;

  public AdminDashboardController(
      StaffAuthService staffAuthService,
      PortalUserRepository portalUserRepository,
      StaffUserRepository staffUserRepository,
      ArticleRepository articleRepository,
      FlashLinkRepository flashLinkRepository,
      FlashTagRepository flashTagRepository,
      BannerRepository bannerRepository) {
    this.staffAuthService = staffAuthService;
    this.portalUserRepository = portalUserRepository;
    this.staffUserRepository = staffUserRepository;
    this.articleRepository = articleRepository;
    this.flashLinkRepository = flashLinkRepository;
    this.flashTagRepository = flashTagRepository;
    this.bannerRepository = bannerRepository;
  }

  @GetMapping("/summary")
  public ResponseEntity<ApiResponse<Map<String, Object>>> summary(
      @RequestHeader(value = "Authorization", required = false) String authorization) {
    String denied = staffAuthService.staffPermissionDenied(authorization, StaffPermissionCodes.DASHBOARD_VIEW);
    if (denied != null) {
      return ResponseEntity.ok(ApiResponse.fail(denied));
    }

    Map<String, Object> m = new LinkedHashMap<>();
    m.put("portalUsersTotal", portalUserRepository.count());
    m.put("staffUsersTotal", staffUserRepository.count());

    m.put("articlesTotal", articleRepository.count());
    m.put("articlesPublished", articleRepository.countByStatus("published"));
    m.put("articlesDraft", articleRepository.countByStatus("draft"));

    m.put("flashTotal", flashLinkRepository.count());
    m.put("flashEnabled", flashLinkRepository.countByEnabledTrue());
    m.put("flashExternalTotal", flashLinkRepository.countByLinkKind("EXTERNAL"));
    m.put("flashInternalTotal", flashLinkRepository.countByLinkKind("INTERNAL"));
    m.put("flashExternalEnabled", flashLinkRepository.countByLinkKindAndEnabledTrue("EXTERNAL"));
    m.put("flashInternalEnabled", flashLinkRepository.countByLinkKindAndEnabledTrue("INTERNAL"));

    m.put("flashTagsTotal", flashTagRepository.count());
    m.put("bannersTotal", bannerRepository.count());

    return ResponseEntity.ok(ApiResponse.success(m));
  }
}

