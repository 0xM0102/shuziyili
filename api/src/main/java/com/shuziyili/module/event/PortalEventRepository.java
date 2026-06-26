package com.shuziyili.module.event;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortalEventRepository extends JpaRepository<PortalEventEntity, String> {

  List<PortalEventEntity> findAllByPublishedTrueOrderBySortOrderAscStartsAtDesc();

  List<PortalEventEntity> findAllByOrderBySortOrderAscStartsAtDesc();
}
