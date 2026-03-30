/** 与当前路由匹配的侧栏/顶栏帮助文案（AdminLayout 中「?」气泡）；键为路径前缀，见 helpForPath。 */
export const PAGE_HELP: Record<string, string> = {
  "/dashboard":
    "后续可在此接入内容概览、待审核、访问趋势等。\n「平台用户」= 门户注册客户；「后台账号」= 可登录本后台的操作员，两套数据相互独立。",
  "/portal-users":
    "门户站点注册的客户账号（portal_users）。与后台操作员数据完全分离；客户通常在门户自行注册，你可在此查看并协助修改资料。",
  "/staff-users":
    "可登录本管理后台的操作员（admin / editor / 运营(operator) / 只读(viewer)）。创建账号需设置初始密码；角色可在列表中切换。与门户注册用户无关。",
  "/verification-records":
    "门户登录/注册时验证码发送记录。若 API 开启 shuziyili.auth.store-plain-otp（默认 true），「验证码」列显示明文；上线前请设 SHUZIYILI_STORE_PLAIN_OTP=false 并勿在库中保留明文。仅 admin 可访问。",
  "/permissions":
    "权限管理：选择角色后，对应勾选其可访问的权限码（系统预置 roles 与 permissions）。仅管理员默认拥有 `permissions.manage`；若无权限将提示「权限不足」。",
  "/articles":
    "「复制链接」为站内路径，可粘贴到门户首页 Banner 的跳转。\n前台域名：开发默认 localhost:3000，生产请在 .env 配置 VITE_SITE_BASE_URL。\n封面上传走 COS 后，文件会出现在「媒体库」。",
  "/banners":
    "全站 Banner 统一在此配置，用 Tab 切换板块（门户首页 / 旅游频道）。各板块均有主位与两个副位（slot 分别为 home_* / travel_*）。副 Banner 须填跳转链接。门户前台读 /api/v1/home/banners（仅 home），旅游页可读 /api/v1/travel/banners。图片可先上传「媒体库」再粘贴 URL。",
  "/flash-links":
    "快讯=门户展示的一段文字（字段仍叫 title）。Tab 仅筛表格：外链另填 http(s) 跳转；站内只填这段文字，不填 URL。可选标签（见「标签管理」）。前台 GET /api/v1/home/flash-links。",
  "/flash-tags":
    "标签管理页：顶部 Tab 分为「快讯 / 文章」两类；在对应分类下维护标签。快讯里选择标签后，门户 /flash 时间线会展示标签徽标。",
  "/media":
    "上方为 COS 只读配置。上传支持 jpg / png / gif / webp，单文件最大 10MB；对象键规则见上传区。列表可复制外链用于文章封面与 Banner。",
};

export function helpForPath(path: string): string | null {
  const hit = Object.keys(PAGE_HELP).find((k) => path === k || path.startsWith(k + "/"));
  return hit ? PAGE_HELP[hit]! : null;
}
