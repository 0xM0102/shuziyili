-- 区分 Banner 所属业务板块（门户首页、旅游等），与 slot 组合唯一约束在应用层校验
ALTER TABLE banners
  ADD COLUMN scope VARCHAR(32) NOT NULL DEFAULT 'home' COMMENT '板块：home、travel 等' AFTER slot;

UPDATE banners SET scope = 'home' WHERE scope IS NULL OR scope = '';

CREATE INDEX idx_banners_scope_slot ON banners (scope, slot);
