-- 修复：初始化账号不应能修改权限（permissions.manage 仅 admin）
-- 1) 撤销 editor 对 permissions.manage 的授权（若存在）
DELETE FROM staff_role_permissions
WHERE role_name = 'editor' AND permission_code = 'permissions.manage';

-- 2) 修复本地引导账号角色异常：将引导创建的默认账号设回 admin（仅当该账号存在时）
UPDATE staff_users
SET role = 'admin'
WHERE identifier = 'mang@gansa.top';

