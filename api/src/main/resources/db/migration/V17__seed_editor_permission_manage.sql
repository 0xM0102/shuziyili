-- 防止本地默认管理员账号 role=editor 时被“权限管理”锁住
-- 把 permissions.manage 也授予 editor（admin 依然拥有全部权限）
INSERT INTO staff_role_permissions (role_name, permission_code, enabled, created_at, updated_at)
VALUES
  ('editor', 'permissions.manage', 1, 0, 0)
ON DUPLICATE KEY UPDATE enabled = 1;

