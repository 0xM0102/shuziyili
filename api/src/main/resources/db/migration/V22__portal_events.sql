CREATE TABLE portal_events (
  id VARCHAR(64) NOT NULL,
  title VARCHAR(500) NOT NULL,
  summary VARCHAR(800) NOT NULL DEFAULT '',
  cover_url VARCHAR(1024) NOT NULL DEFAULT '',
  location VARCHAR(500) NOT NULL DEFAULT '',
  category VARCHAR(32) NOT NULL,
  starts_at BIGINT NOT NULL,
  ends_at BIGINT NOT NULL,
  organizer VARCHAR(500) NOT NULL DEFAULT '',
  register_url VARCHAR(1024) NULL,
  highlights_json TEXT NOT NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL,
  PRIMARY KEY (id),
  KEY idx_portal_events_published_sort (published, sort_order, starts_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
