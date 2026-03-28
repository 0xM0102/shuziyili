-- MySQL 8+ 基线表结构（生产环境由 Flyway 执行；与 JPA 实体命名策略一致）

CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  identifier VARCHAR(190) NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT uk_users_identifier UNIQUE (identifier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessions (
  token VARCHAR(64) NOT NULL,
  identifier VARCHAR(190) NOT NULL,
  expires_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  PRIMARY KEY (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(64) NOT NULL,
  title VARCHAR(500) NOT NULL,
  status VARCHAR(32) NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
