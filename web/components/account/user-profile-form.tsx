"use client";

import { useRef, useState, type ChangeEvent } from "react";
import type { LangCode } from "@/lib/i18n";
import { uiText } from "@/lib/i18n";
import { updateProfile, uploadAvatarFile, type AuthSession } from "@/lib/auth-client";
import { toast } from "@/lib/toast";

const profileErrorZh: Record<string, string> = {
  unauthorized: "登录已失效，请重新登录。",
  invalid_profile: "资料格式不正确（长度或头像链接需为 http/https）。",
  network_error: "网络异常，请稍后重试。",
  unknown: "保存失败，请稍后重试。",
};

const profileErrorEn: Record<string, string> = {
  unauthorized: "Session expired. Please sign in again.",
  invalid_profile: "Invalid profile (length or avatar URL must be http/https).",
  network_error: "Network error. Try again later.",
  unknown: "Could not save. Try again later.",
};

const MAX_AVATAR_BYTES = 10 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

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
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState(() => session.nickname ?? "");
  const [avatarUrl, setAvatarUrl] = useState(() => session.avatarUrl ?? "");
  const [bio, setBio] = useState(() => session.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setProfileError(null);
    const r = await updateProfile({ nickname, avatarUrl, bio });
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

  async function handleAvatarFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!ALLOWED_AVATAR_TYPES.has(f.type)) {
      toast.error(lang === "zh" ? "仅支持 jpg/png/gif/webp" : "Only jpg/png/gif/webp is supported");
      return;
    }
    if (f.size > MAX_AVATAR_BYTES) {
      toast.error(lang === "zh" ? "头像大小不能超过 10MB" : "Avatar must be 10MB or less");
      return;
    }
    setUploadingAvatar(true);
    setProfileError(null);
    const r = await uploadAvatarFile(f);
    setUploadingAvatar(false);
    if (!r.ok) {
      const msg = errMap[r.error] ?? errMap.unknown;
      toast.error(msg);
      return;
    }
    setAvatarUrl(r.url);
    toast.success(lang === "zh" ? "头像已上传" : "Avatar uploaded");
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
        <span className="mb-1 block text-xs font-medium text-muted">{t.profileNickname}</span>
        <input
          type="text"
          maxLength={64}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
        />
      </label>
      <div className="block">
        <span className="mb-1 block text-xs font-medium text-muted">{t.profileAvatarUrl}</span>
        <div className="flex flex-wrap items-stretch gap-2">
          <input
            type="url"
            maxLength={1024}
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://"
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
          />
          <input
            ref={avatarFileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={(e) => void handleAvatarFileChange(e)}
          />
          <button
            type="button"
            disabled={uploadingAvatar}
            onClick={() => avatarFileRef.current?.click()}
            className="shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-opacity hover:bg-muted/40 disabled:opacity-60"
          >
            {uploadingAvatar ? t.profileAvatarUploading : t.profileAvatarUpload}
          </button>
        </div>
      </div>
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
