CREATE TABLE convenience_categories (
  slug VARCHAR(64) NOT NULL,
  title VARCHAR(120) NOT NULL,
  short_title VARCHAR(64) NOT NULL DEFAULT '',
  description VARCHAR(500) NOT NULL DEFAULT '',
  icon VARCHAR(64) NOT NULL DEFAULT 'convenience',
  keywords_json TEXT NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (slug),
  KEY idx_convenience_categories_enabled_sort (enabled, sort_order, title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE convenience_services (
  id VARCHAR(64) NOT NULL,
  category_slug VARCHAR(64) NOT NULL,
  title VARCHAR(200) NOT NULL,
  area VARCHAR(120) NOT NULL DEFAULT '',
  address VARCHAR(500) NOT NULL DEFAULT '',
  contact VARCHAR(200) NOT NULL DEFAULT '',
  hours VARCHAR(200) NOT NULL DEFAULT '',
  summary VARCHAR(800) NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  source_url VARCHAR(1024) NULL,
  map_url VARCHAR(1024) NULL,
  emergency TINYINT(1) NOT NULL DEFAULT 0,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_convenience_services_category_sort (category_slug, enabled, sort_order, title),
  KEY idx_convenience_services_emergency_sort (emergency, enabled, sort_order, title),
  CONSTRAINT fk_convenience_services_category
    FOREIGN KEY (category_slug) REFERENCES convenience_categories(slug)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO staff_permissions (permission_code, display_name, description, enabled, created_at, updated_at) VALUES
  ('convenience.manage', '管理便民服务', '管理门户便民分类、服务目录与应急入口', 1, 0, 0)
ON DUPLICATE KEY UPDATE
  display_name = VALUES(display_name),
  description = VALUES(description),
  enabled = VALUES(enabled);

INSERT INTO staff_role_permissions (role_name, permission_code, enabled, created_at, updated_at) VALUES
  ('admin', 'convenience.manage', 1, 0, 0),
  ('editor', 'convenience.manage', 1, 0, 0)
ON DUPLICATE KEY UPDATE
  enabled = VALUES(enabled);
