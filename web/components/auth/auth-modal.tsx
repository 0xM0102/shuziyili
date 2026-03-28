"use client";

import { useEffect, useState } from "react";
import { uiText } from "@/lib/i18n";
import type { LangCode } from "@/lib/i18n";
import {
  login,
  loginByCode,
  registerWithCode,
  sendLoginCode,
  sendRegisterCode,
  validateIdentifier,
} from "@/lib/auth-client";

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function AuthModal({
  open,
  mode,
  lang,
  onClose,
}: {
  open: boolean;
  mode: "login" | "register";
  lang: LangCode;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  /** 仅登录：密码 / 验证码 */
  const [loginKind, setLoginKind] = useState<"password" | "code">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!open) setSubmitted(false);
      setIdentifier("");
      setPassword("");
      setOtpCode("");
      setLoginKind("password");
      setLoading(false);
      setSendingOtp(false);
      setCooldown(0);
      setError(null);
    }, 0);

    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const t = uiText[lang];
  const title = mode === "login" ? t.login : t.register;

  let errorText: string | null = null;
  if (error) {
    const zh: Record<string, string> = {
      empty: "请输入手机号或邮箱。",
      invalid: "手机号或邮箱格式不正确。",
      weak_password: "密码至少 6 位。",
      already_exists: "该账号已注册，请直接登录。",
      not_found: "账号不存在，请先注册。",
      wrong_password: "密码错误，请重试。",
      registration_disabled: "当前已关闭自助注册，请联系管理员开通账号。",
      too_many_requests: "发送过于频繁，请稍后再试。",
      invalid_code: "验证码格式不正确。",
      code_invalid: "验证码不正确。",
      code_expired: "验证码已过期，请重新获取。",
      code_used: "验证码已失效，请重新获取。",
      unknown: "操作失败，请稍后重试。",
    };
    const en: Record<string, string> = {
      empty: "Please enter phone or email.",
      invalid: "Invalid phone or email format.",
      weak_password: "Password must be at least 6 characters.",
      already_exists: "Account already exists. Please login.",
      not_found: "Account not found. Please register.",
      wrong_password: "Wrong password. Please try again.",
      registration_disabled: "Self-service registration is disabled. Contact admin.",
      too_many_requests: "Too many requests. Try again later.",
      invalid_code: "Invalid verification code format.",
      code_invalid: "Invalid verification code.",
      code_expired: "Code expired. Request a new one.",
      code_used: "Code already used. Request a new one.",
      unknown: "Something went wrong. Try again.",
    };
    errorText = lang === "zh" ? zh[error] ?? error : en[error] ?? error;
  }

  const canSendOtp = cooldown <= 0 && !sendingOtp;

  const sendOtp = async () => {
    const id = identifier.trim();
    const vErr = validateIdentifier(id);
    if (vErr) {
      setError(vErr);
      return;
    }
    if (!canSendOtp) return;
    setSendingOtp(true);
    setError(null);
    try {
      const res =
        mode === "login" ? await sendLoginCode(id) : await sendRegisterCode(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCooldown(60);
    } finally {
      setSendingOtp(false);
    }
  };

  const submitLoginPassword = async () => {
    const res = await login(identifier, password);
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }
    window.dispatchEvent(new Event("shuziyili:auth-changed"));
    setSubmitted(true);
    setLoading(false);
    window.setTimeout(() => onClose(), 550);
  };

  const submitLoginCode = async () => {
    const res = await loginByCode(identifier, otpCode);
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }
    window.dispatchEvent(new Event("shuziyili:auth-changed"));
    setSubmitted(true);
    setLoading(false);
    window.setTimeout(() => onClose(), 550);
  };

  const submitRegister = async () => {
    const res = await registerWithCode(identifier, otpCode, password);
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }
    window.dispatchEvent(new Event("shuziyili:auth-changed"));
    setSubmitted(true);
    setLoading(false);
    window.setTimeout(() => onClose(), 550);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-[420px] rounded-2xl border border-border bg-card p-6 pt-7 shadow-2xl ring-1 ring-black/4 dark:ring-white/6"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-sidebar-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          onClick={onClose}
          aria-label={t.close}
        >
          <CloseIcon />
        </button>

        <div className="pr-8">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            {mode === "register"
              ? lang === "zh"
                ? "验证码将发送至手机号（短信）或邮箱（开发环境见服务端日志）。"
                : "Code via SMS (phone) or email (check server logs in dev)."
              : lang === "zh"
                ? loginKind === "password"
                  ? "使用手机号或邮箱与密码登录。"
                  : "验证码登录：将向已绑定账号的手机或邮箱发送验证码。"
                : loginKind === "password"
                  ? "Sign in with phone or email and password."
                  : "We’ll send a code to your phone (SMS) or email."}
          </p>
        </div>

        {!submitted ? (
          <div className="mt-5 space-y-4">
            {mode === "login" ? (
              <div className="flex gap-1 rounded-xl border border-border bg-sidebar-hover/80 p-1 dark:bg-sidebar-hover/40">
                <button
                  type="button"
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    loginKind === "password"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted hover:text-foreground"
                  }`}
                  onClick={() => {
                    setLoginKind("password");
                    setError(null);
                  }}
                >
                  {lang === "zh" ? "密码登录" : "Password"}
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    loginKind === "code"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted hover:text-foreground"
                  }`}
                  onClick={() => {
                    setLoginKind("code");
                    setError(null);
                  }}
                >
                  {lang === "zh" ? "验证码登录" : "Code"}
                </button>
              </div>
            ) : null}

            <form
              className="space-y-3.5"
              onSubmit={(e) => {
                e.preventDefault();
                void (async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    if (mode === "register") {
                      const err = validateIdentifier(identifier);
                      if (err) {
                        setError(err);
                        setLoading(false);
                        return;
                      }
                      if (otpCode.trim().length < 4) {
                        setError("invalid_code");
                        setLoading(false);
                        return;
                      }
                      if (password.trim().length < 6) {
                        setError("weak_password");
                        setLoading(false);
                        return;
                      }
                      await submitRegister();
                    } else if (loginKind === "password") {
                      const err = validateIdentifier(identifier);
                      if (err) {
                        setError(err);
                        setLoading(false);
                        return;
                      }
                      await submitLoginPassword();
                    } else {
                      const err = validateIdentifier(identifier);
                      if (err) {
                        setError(err);
                        setLoading(false);
                        return;
                      }
                      if (!otpCode.trim()) {
                        setError("invalid_code");
                        setLoading(false);
                        return;
                      }
                      await submitLoginCode();
                    }
                  } catch {
                    setError("unknown");
                    setLoading(false);
                  }
                })();
              }}
            >
              <input
                className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] outline-none transition-shadow placeholder:text-muted/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                placeholder={lang === "zh" ? "手机号或邮箱" : "Phone or email"}
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />

              {mode === "register" || loginKind === "code" ? (
                <div className="flex gap-2">
                  <input
                    className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] outline-none transition-shadow placeholder:text-muted/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                    placeholder={lang === "zh" ? "验证码" : "Code"}
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                  <button
                    type="button"
                    disabled={!canSendOtp}
                    className="shrink-0 rounded-xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-sidebar-hover disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => void sendOtp()}
                  >
                    {sendingOtp
                      ? lang === "zh"
                        ? "发送中…"
                        : "Sending…"
                      : cooldown > 0
                        ? `${cooldown}s`
                        : lang === "zh"
                          ? "获取验证码"
                          : "Send code"}
                  </button>
                </div>
              ) : null}

              {mode === "register" || loginKind === "password" ? (
                <input
                  type="password"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-[15px] outline-none transition-shadow placeholder:text-muted/70 focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  placeholder={lang === "zh" ? "密码（至少 6 位）" : "Password (min 6)"}
                  required
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              ) : null}

              {errorText ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-500/25 bg-red-500/6 px-3.5 py-2.5 text-[14px] leading-snug text-foreground dark:border-red-400/30 dark:bg-red-400/8"
                >
                  {errorText}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {mode === "login"
                  ? lang === "zh"
                    ? "登录"
                    : "Login"
                  : lang === "zh"
                    ? "注册"
                    : "Register"}
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-5 space-y-4 text-sm">
            <p className="rounded-xl border border-primary/20 bg-primary/6 px-4 py-3.5 leading-relaxed text-foreground dark:bg-primary/10">
              {lang === "zh"
                ? mode === "login"
                  ? "登录成功，已为你保持登录状态。"
                  : "注册成功，已为你保持登录状态。"
                : mode === "login"
                  ? "You’re signed in."
                  : "Account created. You’re signed in."}
            </p>
            <button
              type="button"
              className="w-full rounded-xl bg-primary px-4 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-sm hover:opacity-95"
              onClick={onClose}
            >
              {lang === "zh" ? "完成" : "Done"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
