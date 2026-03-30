package com.shuziyili.module.flashlink;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlashTagRepository extends JpaRepository<FlashTagEntity, Long> {

  List<FlashTagEntity> findByTargetKindAndEnabledTrueOrderBySortOrderAscLabelAsc(String targetKind);

  List<FlashTagEntity> findByTargetKindOrderBySortOrderAscLabelAsc(String targetKind);

  Optional<FlashTagEntity> findByTargetKindAndLabel(String targetKind, String label);
}

