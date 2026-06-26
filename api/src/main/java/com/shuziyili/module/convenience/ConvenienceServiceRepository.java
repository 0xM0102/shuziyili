package com.shuziyili.module.convenience;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConvenienceServiceRepository extends JpaRepository<ConvenienceServiceEntity, String> {

  List<ConvenienceServiceEntity> findAllByOrderBySortOrderAscTitleAsc();

  List<ConvenienceServiceEntity> findAllByEnabledTrueOrderBySortOrderAscTitleAsc();

  long countByCategorySlug(String categorySlug);
}
