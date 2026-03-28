-- 用户资料（门户展示 / 管理后台维护）
ALTER TABLE users
  ADD COLUMN display_name VARCHAR(64) NOT NULL DEFAULT '' AFTER role;

ALTER TABLE users
  ADD COLUMN nickname VARCHAR(64) NOT NULL DEFAULT '' AFTER display_name;

ALTER TABLE users
  ADD COLUMN avatar_url VARCHAR(1024) NOT NULL DEFAULT '' AFTER nickname;

ALTER TABLE users
  ADD COLUMN bio VARCHAR(500) NOT NULL DEFAULT '' AFTER avatar_url;

ALTER TABLE users
  ADD COLUMN updated_at BIGINT NOT NULL DEFAULT 0 AFTER bio;

UPDATE users SET updated_at = created_at WHERE updated_at = 0;
