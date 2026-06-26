import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  standaloneContentGridClassName,
  standaloneHeaderClassName,
  standaloneSideRailClassName,
  standaloneWidePageClassName,
} from "@/lib/page-layout";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie 说明",
  description: `${siteConfig.name} 如何使用 Cookie 与浏览器本地存储。`,
  alternates: { canonical: "/cookies" },
};

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="mx-0.5 inline rounded-md border border-border bg-sidebar px-1.5 py-0.5 font-mono text-[12px] font-medium text-foreground">
      {children}
    </code>
  );
}

type ItemProps = {
  tag: string;
  title: string;
  children: ReactNode;
};

function PolicyItem({ tag, title, children }: ItemProps) {
  return (
    <li className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary sm:mt-0.5">
          {tag}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
          <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
        </div>
      </div>
    </li>
  );
}

export default function CookiesPage() {
  return (
    <div className={standaloneWidePageClassName}>
      <header className={`${standaloneHeaderClassName} border-b border-border pb-8 md:pb-10`}>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          合规说明
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Cookie 与本地存储说明
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          为提供账号登录、界面主题与语言偏好等功能，{siteConfig.name}
          （以下简称「本站」）会在您使用的浏览器中写入少量数据，包括 Cookie 与本地存储（localStorage）。本说明帮助您了解其用途；继续使用本站即表示您理解相关做法。
        </p>
      </header>

      <div className={`mt-10 ${standaloneContentGridClassName}`}>
        <section className="space-y-5">
          <h2 className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
            我们可能使用的技术
          </h2>
          <ul className="space-y-4">
            <PolicyItem tag="必" title="必要类">
              用于维持登录会话、安全与基础功能（例如由服务端下发的会话 Cookie，若您使用登录功能）。
            </PolicyItem>
            <PolicyItem tag="偏" title="偏好类">
              用于记住显示主题（浅色 / 深色 / 跟随系统）、界面语言等，通常保存在浏览器 localStorage，键名例如
              <Code>shuziyili_theme</Code>。
            </PolicyItem>
            <PolicyItem tag="示" title="提示记录">
              用于记录您是否已阅读本站关于 Cookie 的提示，避免重复弹出，键名 <Code>shuziyili_cookie_consent</Code>。
            </PolicyItem>
          </ul>
        </section>

        <aside className={standaloneSideRailClassName}>
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
              您的选择
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              您可以在浏览器设置中清除 Cookie 与网站数据；清除后可能需要重新登录，主题等偏好也会恢复为默认。若关闭
              JavaScript 或禁止本地存储，部分功能可能无法正常使用。
            </p>
          </section>

          <nav
            className="flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:flex-wrap sm:items-center"
            aria-label="页面导航"
          >
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 sm:w-auto"
            >
              回首页
            </Link>
            <Link
              href="/about"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground/90 transition-colors hover:bg-sidebar-hover sm:w-auto"
            >
              关于我们
            </Link>
          </nav>
        </aside>
      </div>
    </div>
  );
}
