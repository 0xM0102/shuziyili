INSERT INTO staff_permissions (permission_code, display_name, description, enabled, created_at, updated_at) VALUES
  ('events.manage', '管理活动', '管理门户活动列表与详情', 1, 0, 0);

INSERT INTO staff_role_permissions (role_name, permission_code, enabled, created_at, updated_at) VALUES
  ('admin', 'events.manage', 1, 0, 0),
  ('editor', 'events.manage', 1, 0, 0);
