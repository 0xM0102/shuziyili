import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { TopNav } from "@/components/layout/top-nav";
import { AppToaster } from "@/components/app-toaster";
import { CookieConsentSlot } from "@/components/cookie-consent-slot";
import { ThemeProvider } from "@/components/theme-provider";
import { APP_HEADER_OFFSET_VAR } from "@/lib/layout-tokens";
import { siteConfig } from "@/lib/site";
import "./globals.css";

/** 刘海屏下 `env(safe-area-inset-*)` 生效，避免顶栏/底栏与系统 UI 重叠。 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · ${siteConfig.url.replace(/^https?:\/\//, "")}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/yl_logo.svg", type: "image/svg+xml" }],
    apple: "/yl_logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="antialiased" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-background text-foreground">
        <ThemeProvider>
          <TopNav />
          <AppToaster />
          <CookieConsentSlot />
          {/* 顶栏 `fixed` 不占文档流：主区整体下移并扣除顶栏高度，避免内部滚动层钻到顶栏下方。 */}
          <main
            className="relative z-0 flex min-h-0 w-full max-w-full flex-none flex-col overflow-hidden isolate"
            style={{
              height: `calc(100dvh - var(${APP_HEADER_OFFSET_VAR}))`,
              marginTop: `var(${APP_HEADER_OFFSET_VAR})`,
            }}
          >
            <AppShell>{children}</AppShell>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
