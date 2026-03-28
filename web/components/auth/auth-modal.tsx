"use client";

import { useEffect, useState } from "react";
import { uiText } from "@/lib/i18n";
import type { LangCode } from "@/lib/i18n";
import {
  login,
  loginBySmsCode,
  register,
  registerBySmsCode,
  sendLoginSmsCode,
  sendRegisterSmsCode,
  validateIdentifier,
} from "@/lib/auth-client";

function isPhone(v: string) {
  return /^\+?\d{6,20}$/.test(v.replace(/\s+/g, ""));
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
  const [authMethod, setAuthMethod] = useState<"password" | "sms">("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!open) setSubmitted(false);
      setIdentifier("");
      setPassword("");
      setSmsCode("");
      setAuthMethod("password");
      setLoading(false);
      setSendingSms(false);
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

  const canSendSms = cooldown <= 0 && !sendingSms;

  const sendSms = async () => {
    const id = identifier.trim();
    if (!id) {
      setError("empty");
      return;
    }
    if (!isPhone(id.replace(/\s+/g, ""))) {
      setError("invalid");
      return;
    }
    if (!canSendSms) return;
    setSendingSms(true);
    setError(null);
    try {
      const res =
        mode === "login" ? await sendLoginSmsCode(id) : await sendRegisterSmsCode(id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCooldown(60);
    } finally {
      setSendingSms(false);
    }
  };

  const submitPassword = async () => {
    const passwordTrim = password;
    if (mode === "login") {
      const res = await login(identifier, passwordTrim);
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }
    } else {
      const res = await register(identifier, passwordTrim);
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }
    }
    window.dispatchEvent(new Event("shuziyili:auth-changed"));
    setSubmitted(true);
    setLoading(false);
    window.setTimeout(() => onClose(), 550);
  };

  const submitSms = async () => {
    const id = identifier.trim();
    const code = smsCode.trim();
    if (!id) {
      setError("empty");
      setLoading(false);
      return;
    }
    if (!isPhone(id.replace(/\s+/g, ""))) {
      setError("invalid");
      setLoading(false);
      return;
    }
    if (!code) {
      setError("invalid_code");
      setLoading(false);
      return;
    }
    if (mode === "register" && password.trim().length < 6) {
      setError("weak_password");
      setLoading(false);
      return;
    }

    if (mode === "login") {
      const res = await loginBySmsCode(id, code);
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }
    } else {
      const res = await registerBySmsCode(id, code, password);
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }
    }
    window.dispatchEvent(new Event("shuziyili:auth-changed"));
    setSubmitted(true);
    setLoading(false);
    window.setTimeout(() => onClose(), 550);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted">
              {lang === "zh"
                ? authMethod === "password"
                  ? "使用手机号/邮箱与密码，或使用短信验证码（登录需已开通账号）。"
                  : "短信验证码：登录仅限已注册手机号；注册仅在系统尚无用户时可用。"
                : authMethod === "password"
                  ? "Use phone/email + password, or SMS code."
                  : "SMS: login requires an existing account; register only when no users exist yet."}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-border bg-card px-2 py-1 text-sm text-muted hover:text-foreground"
            onClick={onClose}
          >
            {t.close}
          </button>
        </div>

        {!submitted ? (
          <div className="mt-4 space-y-3">
            <div className="flex rounded-xl border border-border bg-background p-1">
              <button
                type="button"
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  authMethod === "password"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:text-foreground"
                }`}
                onClick={() => {
                  setAuthMethod("password");
                  setError(null);
                }}
              >
                {lang === "zh" ? "密码" : "Password"}
              </button>
              <button
                type="button"
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  authMethod === "sms"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:text-foreground"
                }`}
                onClick={() => {
                  setAuthMethod("sms");
                  setError(null);
                }}
              >
                {lang === "zh" ? "短信验证码" : "SMS code"}
              </button>
            </div>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void (async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    if (authMethod === "password") {
                      const err = validateIdentifier(identifier);
                      if (err) {
                        setError(err);
                        setLoading(false);
                        return;
                      }
                      await submitPassword();
                    } else {
                      await submitSms();
                    }
                  } catch {
                    setError("unknown");
                    setLoading(false);
                  }
                })();
              }}
            >
              {authMethod === "password" ? (
                <>
                  <input
                    className="w-full rounded-xl border border-border bg-background px-3 py-3 text-[15px] outline-none focus:border-primary/60"
                    placeholder={lang === "zh" ? "手机号或邮箱" : "Phone or email"}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  <input
                    type="password"
                    className="w-full rounded-xl border border-border bg-background px-3 py-3 text-[15px] outline-none focus:border-primary/60"
                    placeholder={lang === "zh" ? "密码" : "Password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <input
                    className="w-full rounded-xl border border-border bg-background px-3 py-3 text-[15px] outline-none focus:border-primary/60"
                    placeholder={lang === "zh" ? "手机号（短信仅支持手机号）" : "Phone number"}
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-3 text-[15px] outline-none focus:border-primary/60"
                      placeholder={lang === "zh" ? "验证码" : "Code"}
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={!canSendSms}
                      className="shrink-0 rounded-xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground hover:bg-sidebar-hover disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => void sendSms()}
                    >
                      {sendingSms
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
                  {mode === "register" ? (
                    <input
                      type="password"
                      className="w-full rounded-xl border border-border bg-background px-3 py-3 text-[15px] outline-none focus:border-primary/60"
                      placeholder={lang === "zh" ? "设置登录密码（至少 6 位）" : "Password (min 6)"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  ) : null}
                </>
              )}

              {errorText ? (
                <p className="rounded-xl border border-border bg-sidebar px-3 py-2 text-[15px] text-foreground/90">
                  {errorText}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary px-4 py-3 text-[15px] font-semibold text-primary-foreground hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
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
          <div className="mt-4 space-y-3 text-sm">
            <p className="rounded-xl border border-border bg-sidebar p-3">
              {lang === "zh"
                ? mode === "login"
                  ? "登录成功。你现在已登录。"
                  : "注册成功。你现在已登录。"
                : mode === "login"
                  ? "Login successful. You are now signed in."
                  : "Registration successful. You are now signed in."}
            </p>
            <button
              type="button"
              className="w-full rounded-xl bg-primary px-4 py-3 text-[15px] font-semibold text-primary-foreground hover:opacity-95"
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
