/** 与当前路由匹配的侧栏/顶栏帮助文案（AdminLayout 中「?」气泡）；键为路径前缀，见 helpForPath。支持 \\n 换行。 */
export const PAGE_HELP: Record<string, string> = {
  "/dashboard":
    "后续可在此接入内容概览、待审核、访问趋势等。\n「平台用户」= 门户注册客户；「后台账号」= 可登录本后台的操作员，两套数据相互独立。",
  "/profile":
    "当前登录后台账号的个人资料：头像走与「媒体库」相同的 COS 上传（默认 cms/；个人设置上传为 staff/avatars/）；修改密码需填写当前密码。侧栏无入口，请从顶栏头像菜单进入。",
  "/portal-users":
    "门户站点注册的客户账号（portal_users）。与后台操作员数据完全分离；客户通常在门户自行注册，你可在此按手机号或邮箱搜索并协助修改资料。",
  "/staff-users":
    "可登录本管理后台的操作员（admin / editor / 运营 / 只读）。创建账号需设置初始密码；角色可在列表中下拉切换。与门户注册用户无关。",
  "/verification-records":
    "门户登录/注册时验证码发送记录。若 API 开启 shuziyili.auth.store-plain-otp（默认 true），「验证码」列显示明文；上线前请设 SHUZIYILI_STORE_PLAIN_OTP=false 并勿在库中保留明文。仅 admin 可访问。",
  "/events":
    "管理门户「活动」频道：标题、时间、地点、封面、亮点与报名链接。未发布的活动不会在门户展示。",
  "/convenience":
    "管理门户「便民」频道：分类决定前台入口，服务条目决定电话、地址、外链、状态与应急专区。禁用后不会在门户展示；删除分类前需先删除或迁移该分类下的服务。",
  "/permissions":
    "权限管理：选择角色后，对应勾选其可访问的权限码（系统预置 roles 与 permissions）。仅管理员默认拥有 `permissions.manage`；若无权限将提示「权限不足」。\n\n为当前角色勾选可访问的后台能力；保存后生效。仅管理员可修改本页。",
  "/config-management":
    "列出各上游数据源，用开关启用。主资讯与天气各自只能开一个；首页天聚地区块独立。Key 在 api.env 配置。",
  "/articles":
    "「复制链接」为站内路径，可粘贴到门户首页 Banner 的跳转。\n前台域名：开发默认 localhost:3000，生产请在 .env 配置 VITE_SITE_BASE_URL。\n封面上传走 COS（默认 cms/ 目录）后，文件会出现在「媒体库」。",
  "/home-curation":
    "首页「数伊精选」独立配置：从文章库挑选条目并排序；门户仅展示已发布文章，与文章分类/标签无关。",
  "/banners":
    "全站 Banner：用 Tab 切换板块（门户首页 / 旅游频道）。各板块有主位与两个副位（slot 为 home_* / travel_*），副位须填跳转链接；图片可先上传「媒体库」再粘贴 URL。\n门户前台读 /api/v1/home/banners（仅 home），旅游频道读 /api/v1/travel/banners。",
  "/flash-links":
    "快讯在门户展示为一段文字（字段仍叫 title），首页侧栏、文章侧栏、快讯列表时间线等处可见。Tab 仅筛表格：外链另填 http(s) 跳转；站内只填这段文字，不填 URL。可选标签（见「标签管理」）、来源；每条可有独立分享页（路径 /flash/编号）。前台 GET /api/v1/home/flash-links。\n编辑弹窗里：外链类型填写跳转地址；站内仅展示文案。",
  "/flash-tags":
    "标签管理：顶部 Tab 分为「快讯 / 文章」两类；在对应分类下维护标签，同分类内名称唯一。快讯里为条目选标签后，门户 /flash 时间线会展示标签徽标。",
  "/media":
    "COS 只读配置与文件列表。上传 jpg/png/gif/webp，最大 10MB；对象键在全局前缀下默认进入 cms/yyyy/MM/dd/…（运营素材）。后台操作员头像请在「个人设置」上传（staff/avatars）；门户用户头像在门户站点上传（portal/avatars）。列表可复制外链。\n上传区所示路径为 keyPrefix + 子目录 + 日期 + 随机文件名。",
};

export function helpForPath(path: string): string | null {
  const hit = Object.keys(PAGE_HELP).find((k) => path === k || path.startsWith(k + "/"));
  return hit ? PAGE_HELP[hit]! : null;
}
