"use client";

import { useEffect, useState } from "react";
import type { LangCode } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { updateProfile, type AuthSession } from "@/lib/auth-client";

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

export function UserProfileForm({
  session,
  lang,
  onSaved,
}: {
  session: AuthSession;
  lang: LangCode;
  onSaved?: () => void;
}) {
  const t = uiText[lang];
  const errMap = lang === "zh" ? profileErrorZh : profileErrorEn;

  const [displayName, setDisplayName] = useState("");
  const [nickname, setNickname] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(session.displayName ?? "");
    setNickname(session.nickname ?? "");
    setAvatarUrl(session.avatarUrl ?? "");
    setBio(session.bio ?? "");
    setProfileError(null);
  }, [session]);

  async function handleSave() {
    setSaving(true);
    setProfileError(null);
    const r = await updateProfile({ displayName, nickname, avatarUrl, bio });
    setSaving(false);
    if (!r.ok) {
      setProfileError(errMap[r.error] ?? errMap.unknown);
      return;
    }
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
