"use client";

import { cloneElement, useEffect, useRef, useState } from "react";
import type { FormEvent, InputHTMLAttributes, ReactElement } from "react";
import Image from "next/image";
import { SiteWordmark } from "@/components/brand/site-wordmark";
import { uiText } from "@/lib/i18n";
import type { LangCode } from "@/lib/i18n";
import { siteConfig } from "@/lib/site";
import {
  login,
  loginByCode,
  normalizePhoneForRequest,
  registerWithCode,
  sendLoginCode,
  sendRegisterCode,
  validatePhone,
} from "@/lib/auth-client";
import { toast } from "@/lib/toast";

const REMEMBER_STORAGE_KEY = "shuziyili:remember-login";
const OTP_COOLDOWN_SECONDS = 60;
const SUCCESS_CLOSE_DELAY_MS = 550;

type AuthMode = "login" | "register";
type LoginMethod = "password" | "code";

const AUTH_ERROR_TEXT = {
  zh: {
    empty: "请输入手机号。",
    invalid: "请输入正确的 11 位中国大陆手机号。",
    weak_password: "密码至少 6 位。",
    already_exists: "该手机号已注册，请直接登录。",
    not_found: "该手机号未注册，请先注册。",
    wrong_password: "密码错误，请重试。",
    registration_disabled: "当前已关闭自助注册，请联系管理员开通账号。",
    too_many_requests: "发送过于频繁，请稍后再试。",
    invalid_code: "验证码格式不正确。",
    code_invalid: "验证码不正确。",
    code_expired: "验证码已过期，请重新获取。",
    code_used: "验证码已失效，请重新获取。",
    unknown: "操作失败，请稍后重试。",
  },
  en: {
    empty: "Please enter your phone number.",
    invalid: "Enter a valid 11-digit mainland China mobile number.",
    weak_password: "Password must be at least 6 characters.",
    already_exists: "This number is already registered. Please log in.",
    not_found: "This number is not registered yet.",
    wrong_password: "Wrong password. Please try again.",
    registration_disabled: "Self-service registration is disabled. Contact admin.",
    too_many_requests: "Too many requests. Try again later.",
    invalid_code: "Invalid verification code format.",
    code_invalid: "Invalid verification code.",
    code_expired: "Code expired. Request a new one.",
    code_used: "Code already used. Request a new one.",
    unknown: "Something went wrong. Try again.",
  },
} as const;

function readRememberedPhone() {
  try {
    const raw = window.localStorage.getItem(REMEMBER_STORAGE_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { phone?: string; id?: string };
    if (typeof parsed.phone === "string" && parsed.phone) return parsed.phone;
    if (typeof parsed.id === "string" && parsed.id) return parsed.id;
    return "";
  } catch {
    return "";
  }
}

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

function FloatingField({
  id,
  label,
  className,
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: ReactElement<InputHTMLAttributes<HTMLInputElement>>;
}) {
  const baseInput =
    "peer w-full rounded-lg border border-border bg-background px-3 pb-2.5 pt-5 text-[15px] text-foreground outline-none transition-colors placeholder:text-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card";
  const mergedClassName = [baseInput, children.props.className].filter(Boolean).join(" ");
  const input = cloneElement(children, {
    id,
    placeholder: " ",
    className: mergedClassName,
  });
  return (
    <div className={`relative ${className ?? ""}`}>
      {input}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-3 top-1/2 z-1 origin-left -translate-y-1/2 text-[15px] text-muted transition-all duration-150 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-[15px] peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
      >
        {label}
      </label>
    </div>
  );
}

function RememberToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-muted">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-11 shrink-0 rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40 ${
          checked ? "bg-primary" : "bg-border"
        }`}
      >
        <span
          className={`pointer-events-none absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function AuthModal({
  open,
  mode,
  lang,
  onClose,
}: {
  open: boolean;
  mode: AuthMode;
  lang: LangCode;
  onClose: () => void;
}) {
  const closeTimerRef = useRef<number | null>(null);
  const skipPanelFadeRef = useRef(true);
  const [contentOpaque, setContentOpaque] = useState(true);
  const [activeMode, setActiveMode] = useState<AuthMode>(mode);
  const [loginKind, setLoginKind] = useState<LoginMethod>("password");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const t = uiText[lang];
  const isLogin = activeMode === "login";
  const needsOtp = !isLogin || loginKind === "code";
  const needsPassword = !isLogin || loginKind === "password";
  const normalizedPhone = normalizePhoneForRequest(phone);
  const canSendOtp = needsOtp && cooldown <= 0 && !sendingOtp;

  const authErrorText = (code: string) => {
    const dictionary = lang === "zh" ? AUTH_ERROR_TEXT.zh : AUTH_ERROR_TEXT.en;
    return dictionary[code as keyof typeof dictionary] ?? code;
  };
  const errorText = error ? authErrorText(error) : null;

  const persistRemember = (digits: string) => {
    try {
      if (rememberMe && digits) {
        window.localStorage.setItem(REMEMBER_STORAGE_KEY, JSON.stringify({ phone: digits }));
      } else {
        window.localStorage.removeItem(REMEMBER_STORAGE_KEY);
      }
    } catch {
      // localStorage may be disabled in private mode.
    }
  };

  const clearTransientState = () => {
    setPassword("");
    setOtpCode("");
    setLoading(false);
    setSendingOtp(false);
    setCooldown(0);
    setError(null);
    setSubmitted(false);
  };

  const switchMode = (nextMode: AuthMode) => {
    setActiveMode(nextMode);
    setError(null);
  };

  const switchLoginMethod = (nextMethod: LoginMethod) => {
    setLoginKind(nextMethod);
    setError(null);
  };

  const resetModalState = () => {
    setActiveMode(mode);
    setLoginKind("password");
    setPhone(readRememberedPhone());
    setRememberMe(true);
    clearTransientState();
  };

  useEffect(() => {
    if (!open) return;
    resetModalState();
    skipPanelFadeRef.current = true;
    setContentOpaque(true);
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    if (skipPanelFadeRef.current) {
      skipPanelFadeRef.current = false;
      return;
    }
    setContentOpaque(false);
    const id = window.setTimeout(() => setContentOpaque(true), 40);
    return () => window.clearTimeout(id);
  }, [activeMode, open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return;
    if (!needsOtp && active.id === "auth-otp") {
      active.blur();
    }
    if (!needsPassword && active.id === "auth-password") {
      active.blur();
    }
  }, [needsOtp, needsPassword]);

  if (!open) return null;

  const headline = isLogin
    ? lang === "zh"
      ? `欢迎回到 ${siteConfig.name}`
      : `Welcome back to ${siteConfig.name}`
    : lang === "zh"
      ? "创建你的账号"
      : "Create your account";
  const subline = !isLogin
    ? lang === "zh"
      ? "验证码将以短信形式发送至该手机号。"
      : "We’ll send an SMS verification code to this number."
    : loginKind === "password"
      ? lang === "zh"
        ? "使用手机号与密码登录。"
        : "Sign in with your phone number and password."
      : lang === "zh"
        ? "验证码将发送至该手机号。"
        : "We’ll send a code to this phone number.";
  const quote =
    lang === "zh"
      ? "资讯、旅游与便民服务，一站直达伊犁生活。"
      : "News, travel, and local services — your Yili gateway.";
  const quoteBy = lang === "zh" ? "— 数字伊犁门户" : "— Shuziyili Portal";

  const validateBeforeSubmit = (): string | null => {
    const phoneError = validatePhone(phone);
    if (phoneError) return phoneError;
    if (needsOtp && otpCode.trim().length < 4) return "invalid_code";
    if (needsPassword && password.trim().length < 6) return "weak_password";
    return null;
  };

  const markSubmitSuccess = () => {
    persistRemember(normalizedPhone);
    window.dispatchEvent(new Event("shuziyili:auth-changed"));
    setSubmitted(true);
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => onClose(), SUCCESS_CLOSE_DELAY_MS);
  };

  const submitAuth = async () => {
    const res = isLogin
      ? loginKind === "password"
        ? await login(phone, password)
        : await loginByCode(phone, otpCode)
      : await registerWithCode(phone, otpCode, password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    markSubmitSuccess();
  };

  const sendOtp = async () => {
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      toast.error(authErrorText(phoneError));
      return;
    }
    if (!canSendOtp) return;
    setSendingOtp(true);
    setError(null);
    try {
      const res = isLogin ? await sendLoginCode(phone) : await sendRegisterCode(phone);
      if (!res.ok) {
        setError(res.error);
        toast.error(authErrorText(res.error));
        return;
      }
      setCooldown(OTP_COOLDOWN_SECONDS);
      toast.success(lang === "zh" ? "验证码已发送" : "Verification code sent");
    } finally {
      setSendingOtp(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const validationError = validateBeforeSubmit();
      if (validationError) {
        setError(validationError);
        return;
      }
      await submitAuth();
    } catch {
      setError("unknown");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto px-3 py-6 sm:items-center sm:px-4 sm:py-10">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative flex w-full max-w-[min(100%,920px)] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/25 sm:min-h-[500px] sm:rounded-[1.25rem]"
        role="dialog"
        aria-modal="true"
        aria-label={isLogin ? t.login : t.register}
      >
        <button
          type="button"
          className="absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border/60 backdrop-blur-sm transition-colors hover:bg-sidebar-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40 dark:bg-card/95"
          onClick={onClose}
          aria-label={t.close}
        >
          <CloseIcon />
        </button>

        <aside className="relative hidden w-[42%] min-w-[280px] flex-col justify-between bg-linear-to-br from-[#0c1220] via-[#111827] to-[#1e3a5f] p-8 text-white md:flex">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(33,116,255,0.22),transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[24px_24px]" />
          <div className="relative z-1 flex items-center gap-3">
            <Image
              src={siteConfig.logoPath}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-lg bg-white/95 p-1 shadow"
            />
            <SiteWordmark className="h-6 w-auto shrink-0 text-white/95" />
          </div>
          <div className="relative z-1 space-y-3">
            <p className="text-lg font-medium leading-snug text-white/95">{quote}</p>
            <p className="text-sm text-white/55">{quoteBy}</p>
          </div>
        </aside>

        <div className="relative flex flex-1 flex-col bg-background px-5 pb-8 pt-11 sm:px-9 sm:pt-12 dark:bg-card">
          <div className="mb-6 flex gap-8 border-b border-border">
            <button
              type="button"
              className={`relative -mb-px pb-3 text-sm font-semibold transition-colors duration-300 ease-in-out ${
                isLogin
                  ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-opacity after:duration-300 after:ease-in-out motion-reduce:after:transition-none"
                  : "text-muted hover:text-foreground"
              }`}
              onClick={() => switchMode("login")}
            >
              {lang === "zh" ? "登录" : "Log in"}
            </button>
            <button
              type="button"
              className={`relative -mb-px pb-3 text-sm font-semibold transition-colors duration-300 ease-in-out ${
                !isLogin
                  ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-opacity after:duration-300 after:ease-in-out motion-reduce:after:transition-none"
                  : "text-muted hover:text-foreground"
              }`}
              onClick={() => switchMode("register")}
            >
              {lang === "zh" ? "注册" : "Sign up"}
            </button>
          </div>

          {/* 登录/注册切换：约 480ms 淡入，避免内容瞬间跳变 */}
          <div
            className={`min-h-[70px] ease-out motion-reduce:opacity-100 motion-reduce:transition-none ${
              contentOpaque ? "opacity-100" : "opacity-0"
            } transition-opacity duration-480`}
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">
              {headline}
            </h2>
            <p className="mt-2 max-w-md text-[13px] leading-relaxed text-muted sm:text-sm">{subline}</p>
          </div>

          {!submitted ? (
            <div
              className={`mt-4 flex flex-1 flex-col ease-out motion-reduce:opacity-100 motion-reduce:transition-none ${
                contentOpaque ? "opacity-100" : "opacity-0"
              } transition-opacity duration-480`}
            >
              <div
                className={`flex gap-1 overflow-hidden rounded-lg border border-border/80 bg-sidebar-hover/50 p-1 transition-all duration-500 ease-in-out motion-reduce:duration-150 motion-reduce:transition-none dark:bg-sidebar-hover/25 ${
                  isLogin
                    ? "mb-4 max-h-24 opacity-100"
                    : "pointer-events-none mb-0 max-h-0 border-transparent p-0 opacity-0"
                }`}
                inert={!isLogin}
              >
                <button
                  type="button"
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out motion-reduce:transition-none sm:text-sm ${
                    loginKind === "password"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/70 dark:bg-card"
                      : "text-muted hover:text-foreground"
                  }`}
                  onClick={() => switchLoginMethod("password")}
                >
                  {lang === "zh" ? "密码登录" : "Password"}
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-all duration-300 ease-in-out motion-reduce:transition-none sm:text-sm ${
                    loginKind === "code"
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/70 dark:bg-card"
                      : "text-muted hover:text-foreground"
                  }`}
                  onClick={() => switchLoginMethod("code")}
                >
                  {lang === "zh" ? "验证码登录" : "Code"}
                </button>
              </div>

              <form className="flex flex-col space-y-3" onSubmit={onSubmit}>
                <FloatingField id="auth-phone" label={lang === "zh" ? "手机号" : "Phone number"}>
                  <input
                    required
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </FloatingField>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out motion-reduce:duration-150 motion-reduce:transition-none ${
                    needsOtp
                      ? "max-h-32 opacity-100"
                      : "pointer-events-none max-h-0 opacity-0"
                  }`}
                  inert={!needsOtp}
                >
                  <div className="flex gap-2">
                    <FloatingField
                      id="auth-otp"
                      label={lang === "zh" ? "验证码" : "Verification code"}
                      className="min-w-0 flex-1"
                    >
                      <input
                        required={needsOtp}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </FloatingField>
                    <div className="flex shrink-0 items-end">
                      <button
                        type="button"
                        disabled={!canSendOtp}
                        className="h-[52px] rounded-lg border border-border bg-background px-3.5 text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-sidebar-hover disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card"
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
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out motion-reduce:duration-150 motion-reduce:transition-none ${
                    needsPassword
                      ? "max-h-28 opacity-100"
                      : "pointer-events-none max-h-0 opacity-0"
                  }`}
                  inert={!needsPassword}
                >
                  <FloatingField
                    id="auth-password"
                    label={lang === "zh" ? "密码（至少 6 位）" : "Password (min 6)"}
                  >
                    <input
                      type="password"
                      required={needsPassword}
                      autoComplete={!isLogin ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FloatingField>
                </div>

                <RememberToggle
                  checked={rememberMe}
                  onChange={setRememberMe}
                  label={lang === "zh" ? "记住手机号" : "Remember phone number"}
                />

                {errorText ? (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-500/30 bg-red-500/8 px-3.5 py-2.5 text-[13px] leading-snug text-foreground dark:border-red-400/30 dark:bg-red-400/10"
                  >
                    {errorText}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-3.5 text-[15px] font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:opacity-[0.96] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLogin ? (lang === "zh" ? "登录" : "Log in") : lang === "zh" ? "注册" : "Sign up"}
                </button>
              </form>

              <p className="mt-6 text-center text-[13px] text-muted">
                {isLogin ? (
                  <>
                    {lang === "zh" ? "还没有账号？" : "Don’t have an account? "}
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => switchMode("register")}
                    >
                      {lang === "zh" ? "去注册" : "Sign up"}
                    </button>
                  </>
                ) : (
                  <>
                    {lang === "zh" ? "已有账号？" : "Already have an account? "}
                    <button
                      type="button"
                      className="font-semibold text-primary hover:underline"
                      onClick={() => switchMode("login")}
                    >
                      {lang === "zh" ? "去登录" : "Log in"}
                    </button>
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <p className="rounded-lg border border-primary/25 bg-primary/8 px-4 py-3.5 text-sm leading-relaxed text-foreground dark:bg-primary/12">
                {lang === "zh"
                  ? isLogin
                    ? "登录成功，已为你保持登录状态。"
                    : "注册成功，已为你保持登录状态。"
                  : isLogin
                    ? "You’re signed in."
                    : "Account created. You’re signed in."}
              </p>
              <button
                type="button"
                className="w-full rounded-lg bg-primary px-4 py-3.5 text-[15px] font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:opacity-[0.96]"
                onClick={onClose}
              >
                {lang === "zh" ? "完成" : "Done"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
