-- 后台操作员与门户用户分表；会话增加 scope 区分

RENAME TABLE users TO staff_users;

CREATE TABLE portal_users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  identifier VARCHAR(190) NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  display_name VARCHAR(64) NOT NULL DEFAULT '',
  nickname VARCHAR(64) NOT NULL DEFAULT '',
  avatar_url VARCHAR(1024) NOT NULL DEFAULT '',
  bio VARCHAR(500) NOT NULL DEFAULT '',
  updated_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_portal_users_identifier UNIQUE (identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE sessions ADD COLUMN scope VARCHAR(16) NOT NULL DEFAULT 'STAFF';
