package com.shuziyili.module.auth;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRolePermissionRepository extends JpaRepository<StaffRolePermissionEntity, Long> {

  boolean existsByRoleNameAndPermissionCodeAndEnabledTrue(String roleName, String permissionCode);

  List<StaffRolePermissionEntity> findAllByRoleNameAndEnabledTrue(String roleName);

  void deleteByRoleName(String roleName);
}

