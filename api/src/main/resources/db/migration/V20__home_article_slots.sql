-- 首页「数伊精选 / 今日热榜」：独立配置文章 ID 顺序（与文章类型字段解耦）

CREATE TABLE home_article_slots (
  id BIGINT NOT NULL AUTO_INCREMENT,
  section VARCHAR(32) NOT NULL COMMENT 'featured | hot',
  article_id VARCHAR(64) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_home_article_slots_section_article (section, article_id),
  KEY idx_home_article_slots_section_sort (section, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
