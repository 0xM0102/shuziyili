import { escapeHtml } from "@/lib/escape-html";

/**
 * 上游资讯正文为 HTML 或纯文本摘要，渲染前做最小清理以降低脚本注入风险（非完整 XSS 防护）。
 */
export function sanitizeNewsContentHtml(html: string): string {
  if (!html) return "";
  let s = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  s = s.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  s = s.replace(/\son\w+\s*=/gi, " data-removed=");
  s = s.replace(/<img\b([^>]*?)>/gi, (match, attrs: string) => {
    if (/referrerpolicy\s*=/i.test(attrs)) {
      return `<img${attrs}>`;
    }
    return `<img referrerpolicy="no-referrer"${attrs}>`;
  });
  return s;
}

/** 纯文本摘要包成段落；已有 HTML 则直接清理后输出。 */
export function prepareNewsBodyHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(trimmed);
  if (!looksLikeHtml) {
    const paragraphs = trimmed
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    const body =
      paragraphs.length > 0
        ? paragraphs
            .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
            .join("")
        : `<p>${escapeHtml(trimmed)}</p>`;
    return sanitizeNewsContentHtml(body);
  }

  return sanitizeNewsContentHtml(trimmed);
}
