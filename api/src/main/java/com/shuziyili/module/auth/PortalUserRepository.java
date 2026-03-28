package com.shuziyili.module.auth;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortalUserRepository extends JpaRepository<PortalUserEntity, Long> {
  Optional<PortalUserEntity> findByIdentifier(String identifier);
}
