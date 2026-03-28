package com.shuziyili.module.sms;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SmsCodeRepository extends JpaRepository<SmsCodeEntity, Long> {
  Optional<SmsCodeEntity> findFirstByPhoneAndSceneOrderByCreatedAtDesc(String phone, String scene);

  Page<SmsCodeEntity> findAllByOrderByIdDesc(Pageable pageable);
}

