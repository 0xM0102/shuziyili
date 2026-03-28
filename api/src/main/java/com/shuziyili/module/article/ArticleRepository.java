package com.shuziyili.module.article;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArticleRepository extends JpaRepository<ArticleEntity, String> {

  List<ArticleEntity> findAllByOrderByUpdatedAtDesc();

  java.util.Optional<ArticleEntity> findByIdAndStatus(String id, String status);
}
