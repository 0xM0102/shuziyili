package com.shuziyili.module.banner;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BannerRepository extends JpaRepository<BannerEntity, Long> {

  List<BannerEntity> findAllByOrderBySortOrderAscUpdatedAtDesc();

  List<BannerEntity> findAllByEnabledTrueOrderBySortOrderAscUpdatedAtDesc();

  Optional<BannerEntity> findFirstBySlotOrderByUpdatedAtDesc(String slot);
}

