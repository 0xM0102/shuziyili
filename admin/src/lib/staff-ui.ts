import type { StaffRole } from "@/lib/api-client";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: "管理员",
  editor: "编辑",
  operator: "运营",
  viewer: "只读",
};

export const STAFF_ROLE_OPTIONS = [
  { label: STAFF_ROLE_LABELS.admin, value: "admin" },
  { label: STAFF_ROLE_LABELS.editor, value: "editor" },
  { label: STAFF_ROLE_LABELS.operator, value: "operator" },
  { label: STAFF_ROLE_LABELS.viewer, value: "viewer" },
] as const satisfies ReadonlyArray<{ label: string; value: StaffRole }>;

type StaffIdentityLike = {
  nickname?: string | null;
  identifier?: string | null;
};

/** 列表/头像用展示文案：昵称优先，否则登录账号 */
export function getStaffDisplayName(v: StaffIdentityLike): string {
  const nickname = v.nickname?.trim();
  if (nickname) return nickname;
  const identifier = v.identifier?.trim();
  if (identifier) return identifier;
  return "?";
}

export function getStaffAvatarInitial(v: StaffIdentityLike): string {
  return getStaffDisplayName(v).slice(0, 1);
}

export function formatDateTimeZhCN(ms: number): string {
  if (!Number.isFinite(ms)) return "—";
  try {
    return new Date(ms).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
}
