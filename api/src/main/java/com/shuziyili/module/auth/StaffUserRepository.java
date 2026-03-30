package com.shuziyili.module.auth;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffUserRepository extends JpaRepository<StaffUserEntity, Long> {
  Optional<StaffUserEntity> findByIdentifier(String identifier);

  List<StaffUserEntity> findByIdentifierContainingIgnoreCaseOrderByIdDesc(String fragment);
}
