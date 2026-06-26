/** `<input type="datetime-local">` 与 epoch 毫秒互转（本地时区）。 */
export function msToDatetimeLocalInput(ms: number): string {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 解析 datetime-local；无效或空串时返回 fallback（默认 0）。 */
export function datetimeLocalInputToMs(value: string, fallback = 0): number {
  if (!value) return fallback;
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : fallback;
}

/** 快讯等场景：无效时回退为当前时间。 */
export function datetimeLocalInputToMsOrNow(value: string): number {
  return datetimeLocalInputToMs(value, Date.now());
}
