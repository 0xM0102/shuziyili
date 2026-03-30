package com.shuziyili.module.flashlink;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlashLinkRepository extends JpaRepository<FlashLinkEntity, Long> {

  List<FlashLinkEntity> findTop30ByEnabledTrueOrderBySortOrderAscPublishedAtDesc();

  long countByEnabledTrue();

  long countByLinkKind(String linkKind);

  long countByLinkKindAndEnabledTrue(String linkKind);
}
