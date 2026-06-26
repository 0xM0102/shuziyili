package com.shuziyili.module.convenience;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConvenienceCategoryRepository
    extends JpaRepository<ConvenienceCategoryEntity, String> {

  List<ConvenienceCategoryEntity> findAllByOrderBySortOrderAscTitleAsc();

  List<ConvenienceCategoryEntity> findAllByEnabledTrueOrderBySortOrderAscTitleAsc();
}
