-- 门户数据源与首页地区资讯：管理后台可写，API Key 仍由 env 提供

CREATE TABLE portal_settings (
  setting_key VARCHAR(64) NOT NULL,
  setting_value VARCHAR(512) NOT NULL DEFAULT '',
  updated_at BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO staff_permissions (permission_code, display_name, description, enabled, created_at, updated_at) VALUES
  ('portal_settings.manage', '管理门户数据源', '配置资讯/天气 Provider 与首页地区资讯', 1, 0, 0);

INSERT INTO staff_role_permissions (role_name, permission_code, enabled, created_at, updated_at) VALUES
  ('admin', 'portal_settings.manage', 1, 0, 0);
