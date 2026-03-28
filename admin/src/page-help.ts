/** 与 AdminLayout 顶部标题对应的说明文案（点击「?」气泡查看） */
export const PAGE_HELP: Record<string, string> = {
  "/dashboard":
    "后续可在此接入内容概览、待审核、访问趋势等。\n「平台用户」= 门户注册客户；「后台账号」= 可登录本后台的操作员，两套数据相互独立。",
  "/portal-users":
    "门户站点注册的客户账号（portal_users）。与后台操作员数据完全分离；客户通常在门户自行注册，你可在此查看并协助修改资料。",
  "/staff-users":
    "可登录本管理后台的操作员（admin / editor）。创建账号需设置初始密码；角色可在列表中切换。与门户注册用户无关。",
  "/verification-records":
    "门户登录/注册时验证码发送记录。若 API 开启 shuziyili.auth.store-plain-otp（默认 true），「验证码」列显示明文；上线前请设 SHUZIYILI_STORE_PLAIN_OTP=false 并勿在库中保留明文。仅 admin 可访问。",
  "/articles":
    "「复制链接」为站内路径，可粘贴到首页 Banner 的跳转。\n前台域名：开发默认 localhost:3000，生产请在 .env 配置 VITE_SITE_BASE_URL。\n封面上传走 COS 后，文件会出现在「媒体库」。",
  "/banners":
    "首页轮播：主 Banner（左侧大图）一张；右上 / 右下副 Banner 各一张。副 Banner 必须填写跳转链接（如 /a/文章ID）。图片可先上传「媒体库」再粘贴 URL。",
  "/media":
    "上方为 COS 只读配置。上传支持 jpg / png / gif / webp，单文件最大 10MB；对象键规则见上传区。列表可复制外链用于文章封面与 Banner。",
  "/content": "旧版占位，请使用左侧「文章管理」。",
};

export function helpForPath(path: string): string | null {
  const hit = Object.keys(PAGE_HELP).find((k) => path === k || path.startsWith(k + "/"));
  return hit ? PAGE_HELP[hit]! : null;
}
