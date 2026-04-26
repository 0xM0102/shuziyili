const ZH_CN_DATETIME: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

/**
 * 常用「年月日 时:分」中文展示。`ms === 0` 时返回 em dash（用于可选缓存时间等）。
 */
export function formatEpochMsZhCN(ms: number): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("zh-CN", ZH_CN_DATETIME).format(new Date(ms));
}
