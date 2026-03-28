"use client";

import { useState } from "react";
import type { LangCode } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { updateProfile, type AuthSession } from "@/lib/auth-client";
import { toast } from "@/lib/toast";

const profileErrorZh: Record<string, string> = {
  unauthorized: "登录已失效，请重新登录。",
  invalid_profile: "资料格式不正确（长度或头像链接需为 http/https）。",
  unknown: "保存失败，请稍后重试。",
};

const profileErrorEn: Record<string, string> = {
  unauthorized: "Session expired. Please sign in again.",
  invalid_profile: "Invalid profile (length or avatar URL must be http/https).",
  unknown: "Could not save. Try again later.",
};

type FormProps = {
  session: AuthSession;
  lang: LangCode;
  onSaved?: () => void;
};

/** 用 key 随 session 版本重置本地表单状态，避免在 effect 里同步 setState（eslint react-hooks/set-state-in-effect）。 */
export function UserProfileForm(props: FormProps) {
  const { session } = props;
  const formKey = `${session.identifier}:${session.updatedAt}`;
  return <UserProfileFormBody key={formKey} {...props} />;
}

function UserProfileFormBody({ session, lang, onSaved }: FormProps) {
  const t = uiText[lang];
  const errMap = lang === "zh" ? profileErrorZh : profileErrorEn;

  const [displayName, setDisplayName] = useState(() => session.displayName ?? "");
  const [nickname, setNickname] = useState(() => session.nickname ?? "");
  const [avatarUrl, setAvatarUrl] = useState(() => session.avatarUrl ?? "");
  const [bio, setBio] = useState(() => session.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setProfileError(null);
    const r = await updateProfile({ displayName, nickname, avatarUrl, bio });
    setSaving(false);
    if (!r.ok) {
      const msg = errMap[r.error] ?? errMap.unknown;
      setProfileError(msg);
      toast.error(msg);
      return;
    }
    toast.success(lang === "zh" ? "资料已保存" : "Profile saved");
    onSaved?.();
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card/40 p-4">
      <div>
        <p className="text-[15px] font-semibold text-foreground">{t.profileMy}</p>
        <p className="mt-1 text-xs text-muted">
          {t.profileIdentifier}{" "}
          <span className="font-mono text-foreground/80">{session.identifier}</span>
        </p>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">{t.profileDisplayName}</span>
        <input
          type="text"
          maxLength={64}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">{t.profileNickname}</span>
        <input
          type="text"
          maxLength={64}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">{t.profileAvatarUrl}</span>
        <input
          type="url"
          maxLength={1024}
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">{t.profileBio}</span>
        <textarea
          maxLength={500}
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
        />
      </label>
      {profileError ? (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">{profileError}</p>
      ) : null}
      <button
        type="button"
        disabled={saving}
        onClick={() => void handleSave()}
        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:opacity-60"
      >
        {saving ? t.profileSaving : t.profileSave}
      </button>
    </div>
  );
}
