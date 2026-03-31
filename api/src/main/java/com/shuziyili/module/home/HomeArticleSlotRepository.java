package com.shuziyili.module.home;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeArticleSlotRepository extends JpaRepository<HomeArticleSlotEntity, Long> {

  List<HomeArticleSlotEntity> findAllBySectionOrderBySortOrderAsc(String section);

  void deleteBySection(String section);
}
