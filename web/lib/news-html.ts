/**
 * 上游资讯正文为 HTML 字符串，渲染前做最小清理以降低脚本注入风险（非完整 XSS 防护，不可替代 CSP 与可信来源约束）。
 */
export function sanitizeNewsContentHtml(html: string): string {
  if (!html) return "";
  let s = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  s = s.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  s = s.replace(/\son\w+\s*=/gi, " data-removed=");
  return s;
}
