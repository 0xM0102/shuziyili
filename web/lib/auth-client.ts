import { getPublicApiV1Base } from "@/lib/api-base";

export type AuthSession = {
  identifier: string;
  token: string;
  createdAt: number;
  nickname: string;
  avatarUrl: string;
  bio: string;
  updatedAt: number;
};

type ApiResponse<T> = {
  ok: boolean;
  message: string | null;
  data: T | null;
};

type AuthLoginRegisterData = {
  token: string;
  identifier: string;
};

type StoredSession = AuthSession;

const SESSION_KEY = "shuziyili_session_v1";

function apiBase() {
  return getPublicApiV1Base();
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/** 去空格并去掉常见 +86 / 86 前缀，得到 11 位大陆手机号形态（不含国家码）。 */
export function normalizePhoneForRequest(raw: string) {
  let s = raw.trim().replace(/\s+/g, "");
  if (s.startsWith("+86")) s = s.slice(3);
  else if (s.startsWith("86") && s.length === 13 && s[2] === "1") s = s.slice(2);
  return s;
}

/** 门户仅支持手机号登录/注册（与短信通道一致）。 */
export function validatePhone(raw: string): string | null {
  const v = normalizePhoneForRequest(raw);
  if (!v) return "empty";
  if (!/^1[3-9]\d{9}$/.test(v)) return "invalid";
  return null;
}

function getStoredSession(): StoredSession | null {
  if (!canUseStorage()) return null;
  const parsed = safeParseJson<Partial<StoredSession>>(localStorage.getItem(SESSION_KEY));
  if (!parsed?.token || !parsed?.identifier) return null;
  const prof = emptyProfile();
  return {
    identifier: parsed.identifier,
    token: parsed.token,
    createdAt: typeof parsed.createdAt === "number" ? parsed.createdAt : Date.now(),
    nickname: typeof parsed.nickname === "string" ? parsed.nickname : prof.nickname,
    avatarUrl: typeof parsed.avatarUrl === "string" ? parsed.avatarUrl : prof.avatarUrl,
    bio: typeof parsed.bio === "string" ? parsed.bio : prof.bio,
    updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : prof.updatedAt,
  };
}

function setStoredSession(session: StoredSession) {
  if (!canUseStorage()) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  const s = getStoredSession();
  return s;
}

function emptyProfile(): Pick<AuthSession, "nickname" | "avatarUrl" | "bio" | "updatedAt"> {
  return {
    nickname: "",
    avatarUrl: "",
    bio: "",
    updatedAt: 0,
  };
}

function meFieldsFromApi(data: Record<string, string>): Omit<AuthSession, "token" | "createdAt"> {
  return {
    identifier: data.identifier ?? "",
    nickname: data.nickname ?? "",
    avatarUrl: data.avatarUrl ?? "",
    bio: data.bio ?? "",
    updatedAt: Number(data.updatedAt) || 0,
  };
}

async function apiRequest<T>(
  path: string,
  opts: {
    method: "GET" | "POST" | "PUT";
    body?: unknown;
    token?: string;
  }
): Promise<ApiResponse<T>> {
  const url = `${apiBase()}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts.token) {
    headers.Authorization = `Bearer ${opts.token}`;
  }

  const res = await fetch(url, {
    method: opts.method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "include",
  });

  try {
    const json = (await res.json()) as ApiResponse<T>;
    return json;
  } catch {
    return {
      ok: false,
      message: "network_error",
      data: null,
    };
  }
}

async function uploadMultipart<T>(
  path: string,
  file: File,
  token: string
): Promise<ApiResponse<T>> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
    credentials: "include",
  });
  try {
    return (await res.json()) as ApiResponse<T>;
  } catch {
    return { ok: false, message: "network_error", data: null };
  }
}

export async function sendRegisterCode(identifierRaw: string) {
  const err = validatePhone(identifierRaw);
  if (err) return { ok: false as const, error: err };
  const phone = normalizePhoneForRequest(identifierRaw);
  const res = await apiRequest<{ sent: string }>("/auth/register/send", {
    method: "POST",
    body: { identifier: phone },
  });
  if (!res.ok) return { ok: false as const, error: res.message ?? "unknown" };
  return { ok: true as const };
}

export async function registerWithCode(identifierRaw: string, code: string, password: string) {
  const err = validatePhone(identifierRaw);
  if (err) return { ok: false as const, error: err };
  if (password.trim().length < 6) return { ok: false as const, error: "weak_password" };
  const c = code.trim();
  if (!c) return { ok: false as const, error: "invalid_code" };
  const phone = normalizePhoneForRequest(identifierRaw);

  const res = await apiRequest<AuthLoginRegisterData>("/auth/register", {
    method: "POST",
    body: {
      identifier: phone,
      code: c,
      password,
    },
  });

  if (!res.ok || !res.data) {
    return { ok: false as const, error: res.message ?? "unknown" };
  }

  const session: AuthSession = {
    identifier: res.data.identifier,
    token: res.data.token,
    createdAt: Date.now(),
    ...emptyProfile(),
  };
  setStoredSession(session);
  return { ok: true as const, session };
}

export async function login(identifierRaw: string, password: string) {
  const err = validatePhone(identifierRaw);
  if (err) return { ok: false as const, error: err };
  if (!password.trim()) return { ok: false as const, error: "wrong_password" };
  const phone = normalizePhoneForRequest(identifierRaw);

  const res = await apiRequest<AuthLoginRegisterData>("/auth/login", {
    method: "POST",
    body: {
      identifier: phone,
      password,
    },
  });

  if (!res.ok || !res.data) {
    return { ok: false as const, error: res.message ?? "unknown" };
  }

  const session: AuthSession = {
    identifier: res.data.identifier,
    token: res.data.token,
    createdAt: Date.now(),
    ...emptyProfile(),
  };
  setStoredSession(session);
  return { ok: true as const, session };
}

export async function fetchMe(): Promise<AuthSession | null> {
  const current = getStoredSession();
  if (!current) return null;

  const res = await apiRequest<Record<string, string>>("/auth/me", {
    method: "GET",
    token: current.token,
  });

  if (!res.ok || !res.data) {
    if (canUseStorage()) localStorage.removeItem(SESSION_KEY);
    return null;
  }
  const merged: AuthSession = {
    token: current.token,
    createdAt: current.createdAt,
    ...meFieldsFromApi(res.data),
  };
  setStoredSession(merged);
  return merged;
}

export async function sendLoginCode(identifierRaw: string) {
  const err = validatePhone(identifierRaw);
  if (err) return { ok: false as const, error: err };
  const phone = normalizePhoneForRequest(identifierRaw);
  const res = await apiRequest<{ sent: string }>("/auth/login/send", {
    method: "POST",
    body: { identifier: phone },
  });
  if (!res.ok) return { ok: false as const, error: res.message ?? "unknown" };
  return { ok: true as const };
}

export async function loginByCode(identifierRaw: string, code: string) {
  const err = validatePhone(identifierRaw);
  if (err) return { ok: false as const, error: err };
  const c = code.trim();
  if (!c) return { ok: false as const, error: "invalid_code" };
  const phone = normalizePhoneForRequest(identifierRaw);

  const res = await apiRequest<AuthLoginRegisterData>("/auth/login/code", {
    method: "POST",
    body: { identifier: phone, code: c },
  });

  if (!res.ok || !res.data) {
    return { ok: false as const, error: res.message ?? "unknown" };
  }

  const session: AuthSession = {
    identifier: res.data.identifier,
    token: res.data.token,
    createdAt: Date.now(),
    ...emptyProfile(),
  };
  setStoredSession(session);
  return { ok: true as const, session };
}

export function navDisplayName(session: AuthSession): string {
  const nick = session.nickname?.trim();
  if (nick) return nick;
  return session.identifier;
}

export async function updateProfile(payload: {
  nickname: string;
  avatarUrl: string;
  bio: string;
}): Promise<{ ok: true; session: AuthSession } | { ok: false; error: string }> {
  const current = getStoredSession();
  if (!current) return { ok: false, error: "unauthorized" };

  const res = await apiRequest<Record<string, string>>("/auth/profile", {
    method: "PUT",
    body: payload,
    token: current.token,
  });

  if (!res.ok || !res.data) {
    return { ok: false, error: res.message ?? "unknown" };
  }

  const merged: AuthSession = {
    token: current.token,
    createdAt: current.createdAt,
    ...meFieldsFromApi(res.data),
  };
  setStoredSession(merged);
  return { ok: true, session: merged };
}

/** 门户头像上传到 COS（路径前缀 portal/avatars）；需登录。 */
export async function uploadAvatarFile(
  file: File
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const current = getStoredSession();
  if (!current) return { ok: false, error: "unauthorized" };
  const json = await uploadMultipart<{ key: string; url: string }>(
    "/auth/media/upload",
    file,
    current.token
  );
  if (!json.ok || !json.data?.url) {
    return { ok: false, error: json.message ?? "unknown" };
  }
  return { ok: true, url: json.data.url };
}

export async function logout() {
  const current = getStoredSession();
  if (current) {
    try {
      await apiRequest<void>("/auth/logout", {
        method: "POST",
        token: current.token,
      });
    } catch {
      // 忽略网络错误，仍清理本地 token
    }
  }
  if (canUseStorage()) localStorage.removeItem(SESSION_KEY);
}

