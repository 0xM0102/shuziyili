export type LangCode = "zh" | "en";

export const languages: { code: LangCode; label: string }[] = [
  { code: "zh", label: "中文" },
  { code: "en", label: "English" },
];

export const uiText: Record<
  LangCode,
  {
    searchPlaceholder: string;
    functions: string;
    login: string;
    register: string;
    logout: string;
    account: string;
    close: string;
    searchTitle: string;
    searchEmpty: string;
    personalCenter: string;
    accountHint: string;
    accountGoLogin: string;
    accountPageSubtitle: string;
    profileMy: string;
    profileIdentifier: string;
    profileDisplayName: string;
    profileNickname: string;
    profileAvatarUrl: string;
    profileBio: string;
    profileSave: string;
    profileSaving: string;
    profileUpdated: string;
  }
> = {
  zh: {
    searchPlaceholder: "搜索伊犁资讯/服务/活动...",
    functions: "功能",
    login: "登录",
    register: "注册",
    logout: "退出",
    account: "账号",
    close: "关闭",
    searchTitle: "搜索结果（占位）",
    searchEmpty: "暂无结果（占位）。",
    personalCenter: "个人中心",
    accountHint: "登录后可编辑资料、查看账号信息并安全退出。",
    accountGoLogin: "去登录",
    accountPageSubtitle: "在此维护展示名、昵称、头像与简介；主题、语言与外观请点击右上角头像，在菜单里打开「设置」。",
    profileMy: "我的资料",
    profileIdentifier: "登录账号",
    profileDisplayName: "显示名",
    profileNickname: "昵称",
    profileAvatarUrl: "头像 URL（https://…）",
    profileBio: "简介",
    profileSave: "保存资料",
    profileSaving: "保存中…",
    profileUpdated: "资料更新时间",
  },
  en: {
    searchPlaceholder: "Search Yili info/services/events...",
    functions: "Functions",
    login: "Login",
    register: "Register",
    logout: "Logout",
    account: "Account",
    close: "Close",
    searchTitle: "Search Results (Placeholder)",
    searchEmpty: "No results (placeholder).",
    personalCenter: "Profile",
    accountHint: "Sign in to edit your profile and manage your account.",
    accountGoLogin: "Sign in",
    accountPageSubtitle:
      "Update your profile here. Theme, language, and display: open your account menu (avatar) and choose Settings.",
    profileMy: "Profile",
    profileIdentifier: "Sign-in ID",
    profileDisplayName: "Display name",
    profileNickname: "Nickname",
    profileAvatarUrl: "Avatar URL (https://…)",
    profileBio: "Bio",
    profileSave: "Save profile",
    profileSaving: "Saving…",
    profileUpdated: "Profile updated",
  },
};

export const navLabels: Record<
  LangCode,
  Record<string, string>
> = {
  zh: {
    "/": "首页",
    "/travel": "旅游",
    "/convenience": "便民",
    "/nomad": "数字游民",
    "/events": "活动",
    "/news": "资讯",
    "/account": "个人中心",
    "/about": "关于",
  },
  en: {
    "/": "Home",
    "/travel": "Travel",
    "/convenience": "Convenience",
    "/nomad": "Nomad",
    "/events": "Events",
    "/news": "News",
    "/account": "Profile",
    "/about": "About",
  },
};

export function getBrowserLang(): LangCode {
  try {
    const raw = navigator.language || "";
    if (raw.toLowerCase().startsWith("en")) return "en";
    return "zh";
  } catch {
    return "zh";
  }
}

