-- 快讯类型：外链（第三方）或站内路径
ALTER TABLE flash_links
  ADD COLUMN link_kind VARCHAR(16) NOT NULL DEFAULT 'EXTERNAL' AFTER url;
