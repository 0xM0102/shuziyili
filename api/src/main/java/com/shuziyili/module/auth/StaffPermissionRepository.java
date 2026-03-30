package com.shuziyili.module.auth;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffPermissionRepository extends JpaRepository<StaffPermissionEntity, String> {

  List<StaffPermissionEntity> findAllByOrderByPermissionCodeAsc();
}

