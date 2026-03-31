-- 用户资料仅保留 nickname：合并原 display_name 后删除列（角色/权限表的 display_name 不变）

UPDATE portal_users
SET nickname = CASE
  WHEN NULLIF(TRIM(nickname), '') IS NOT NULL THEN TRIM(nickname)
  WHEN NULLIF(TRIM(display_name), '') IS NOT NULL THEN TRIM(display_name)
  ELSE ''
END;

UPDATE staff_users
SET nickname = CASE
  WHEN NULLIF(TRIM(nickname), '') IS NOT NULL THEN TRIM(nickname)
  WHEN NULLIF(TRIM(display_name), '') IS NOT NULL THEN TRIM(display_name)
  ELSE ''
END;

ALTER TABLE portal_users DROP COLUMN display_name;
ALTER TABLE staff_users DROP COLUMN display_name;
