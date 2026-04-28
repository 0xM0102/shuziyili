import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { TopNav } from "@/components/layout/top-nav";
import { AppToaster } from "@/components/app-toaster";
import { CookieConsentSlot } from "@/components/cookie-consent-slot";
import { ThemeProvider } from "@/components/theme-provider";
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
          {/* 整页不滚动：`main` 内单列滚动；`z-0` 与顶栏 `z-50` 分层，避免内容层叠盖住顶栏。 */}
          <main className="relative z-0 flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden">
            <AppShell>{children}</AppShell>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
