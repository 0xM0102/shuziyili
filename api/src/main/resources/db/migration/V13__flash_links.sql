-- 首页「7×24 快讯」：外链标题 + 跳转，不存储正文
CREATE TABLE flash_links (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(500) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  source_label VARCHAR(120) NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  published_at BIGINT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_flash_links_enabled (enabled, sort_order, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
