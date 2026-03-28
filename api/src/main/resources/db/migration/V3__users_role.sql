-- 增加用户角色字段（admin/editor）
ALTER TABLE users
  ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'editor' AFTER password_hash;

