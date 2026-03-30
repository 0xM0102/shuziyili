package com.shuziyili.module.banner;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/** 按 scope 隔离各板块 Banner；副位唯一性在 Service 层结合 slot 校验。 */
public interface BannerRepository extends JpaRepository<BannerEntity, Long> {

  List<BannerEntity> findAllByScopeOrderBySortOrderAscUpdatedAtDesc(String scope);

  List<BannerEntity> findAllByScopeAndEnabledTrueOrderBySortOrderAscUpdatedAtDesc(String scope);

  Optional<BannerEntity> findFirstByScopeAndSlotOrderByUpdatedAtDesc(String scope, String slot);
}
