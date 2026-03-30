-- 后台角色与权限管理（RBAC）

CREATE TABLE staff_roles (
  role_name VARCHAR(32) NOT NULL,
  display_name VARCHAR(64) NOT NULL DEFAULT '',
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL DEFAULT 0,
  updated_at BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE staff_permissions (
  permission_code VARCHAR(64) NOT NULL,
  display_name VARCHAR(120) NOT NULL DEFAULT '',
  description VARCHAR(255) NOT NULL DEFAULT '',
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at BIGINT NOT NULL DEFAULT 0,
  updated_at BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (permission_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE staff_role_permissions (
  id BIGINT NOT NULL AUTO_INCREMENT,
  role_name VARCHAR(32) NOT NULL,
  permission_code VARCHAR(64) NOT NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at BIGINT NOT NULL DEFAULT 0,
  updated_at BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_role_perm (role_name, permission_code),
  KEY idx_role_perm_enabled (role_name, enabled, permission_code),
  CONSTRAINT fk_srp_role
    FOREIGN KEY (role_name) REFERENCES staff_roles(role_name)
    ON DELETE CASCADE,
  CONSTRAINT fk_srp_perm
    FOREIGN KEY (permission_code) REFERENCES staff_permissions(permission_code)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 默认角色：admin / editor / operator(运营) / viewer =====
-- created_at/updated_at 仅用于展示，取 0 也可
INSERT INTO staff_roles (role_name, display_name, enabled, sort_order, created_at, updated_at) VALUES
  ('admin', '管理员', 1, 0, 0, 0),
  ('editor', '编辑', 1, 1, 0, 0),
  ('operator', '运营', 1, 2, 0, 0),
  ('viewer', '只读', 1, 3, 0, 0);

-- ===== 默认权限 =====
INSERT INTO staff_permissions (permission_code, display_name, description, enabled, created_at, updated_at) VALUES
  ('dashboard.view', '查看仪表盘', '允许访问后台首页概览', 1, 0, 0),
  ('staff.manage', '管理后台账号', '管理 staff-users（创建/角色/资料）', 1, 0, 0),
  ('portal_users.manage', '管理平台用户', '管理 portal-users', 1, 0, 0),
  ('verification_records.manage', '管理验证码发送记录', '管理 verification-records', 1, 0, 0),
  ('articles.manage', '管理文章', '管理文章增删改查', 1, 0, 0),
  ('banners.manage', '管理 Banner', '管理 banners', 1, 0, 0),
  ('flash_links.manage', '管理快讯', '管理 flash-links（外链/站内一句话）', 1, 0, 0),
  ('flash_tags.manage', '管理快讯标签', '管理 flash-tags（快讯/文章分类标签）', 1, 0, 0),
  ('media.manage', '管理媒体库', '管理 media（上传/删除/配置）', 1, 0, 0),
  ('permissions.manage', '管理权限', '管理角色-权限映射', 1, 0, 0);

-- ===== 默认映射：角色 -> 权限 =====
-- admin：全部
INSERT INTO staff_role_permissions (role_name, permission_code, enabled, created_at, updated_at) VALUES
  ('admin', 'dashboard.view', 1, 0, 0),
  ('admin', 'staff.manage', 1, 0, 0),
  ('admin', 'portal_users.manage', 1, 0, 0),
  ('admin', 'verification_records.manage', 1, 0, 0),
  ('admin', 'articles.manage', 1, 0, 0),
  ('admin', 'banners.manage', 1, 0, 0),
  ('admin', 'flash_links.manage', 1, 0, 0),
  ('admin', 'flash_tags.manage', 1, 0, 0),
  ('admin', 'media.manage', 1, 0, 0),
  ('admin', 'permissions.manage', 1, 0, 0);

-- editor：内容编辑类（不含 staff/portal/verification 这些后台敏感操作）
INSERT INTO staff_role_permissions (role_name, permission_code, enabled, created_at, updated_at) VALUES
  ('editor', 'dashboard.view', 1, 0, 0),
  ('editor', 'articles.manage', 1, 0, 0),
  ('editor', 'banners.manage', 1, 0, 0),
  ('editor', 'flash_links.manage', 1, 0, 0),
  ('editor', 'flash_tags.manage', 1, 0, 0),
  ('editor', 'media.manage', 1, 0, 0);

-- operator(运营)：更侧重快讯与文章
INSERT INTO staff_role_permissions (role_name, permission_code, enabled, created_at, updated_at) VALUES
  ('operator', 'dashboard.view', 1, 0, 0),
  ('operator', 'articles.manage', 1, 0, 0),
  ('operator', 'flash_links.manage', 1, 0, 0),
  ('operator', 'flash_tags.manage', 1, 0, 0);

-- viewer：只读（仪表盘）
INSERT INTO staff_role_permissions (role_name, permission_code, enabled, created_at, updated_at) VALUES
  ('viewer', 'dashboard.view', 1, 0, 0);

