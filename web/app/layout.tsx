import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { TopNav } from "@/components/layout/top-nav";
import { AppToaster } from "@/components/app-toaster";
import { CookieConsentSlot } from "@/components/cookie-consent-slot";
import { ThemeProvider } from "@/components/theme-provider";
import { siteConfig } from "@/lib/site";
import "./globals.css";

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
      <body className="flex h-screen min-h-0 flex-col overflow-hidden bg-background text-foreground">
        <ThemeProvider>
          <TopNav />
          <AppToaster />
          <CookieConsentSlot />
          {/* 禁止整页滚动：滚动只发生在侧栏与右侧内容列各自的 overflow 区域内。 */}
          <main className="flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden">
            <AppShell>{children}</AppShell>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
