-- 快讯标签：用于 /flash 时间线打标签
CREATE TABLE flash_tags (
  id BIGINT NOT NULL AUTO_INCREMENT,
  target_kind VARCHAR(16) NOT NULL,
  label VARCHAR(64) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at BIGINT NOT NULL DEFAULT 0,
  updated_at BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_flash_tags_target_label (target_kind, label),
  KEY idx_flash_tags_target_enabled_sort (target_kind, enabled, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 给快讯挂一个标签（可空）
ALTER TABLE flash_links
  ADD COLUMN tag_id BIGINT NULL AFTER published_at;

ALTER TABLE flash_links
  ADD CONSTRAINT fk_flash_links_tag_id
  FOREIGN KEY (tag_id) REFERENCES flash_tags(id) ON DELETE SET NULL;

