package com.shuziyili.module.auth;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRoleRepository extends JpaRepository<StaffRoleEntity, String> {

  List<StaffRoleEntity> findAllByOrderBySortOrderAscRoleNameAsc();
}

