"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { SiteWordmark } from "@/components/brand/site-wordmark";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full min-w-0 max-w-full border-t border-border bg-card">
      <div className="w-full min-w-0 max-w-full px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-foreground">
              {/* eslint-disable-next-line @next/next/no-img-element -- 与顶栏相同，品牌 SVG 来自 public */}
              <img
                src={siteConfig.logoPath}
                alt=""
                width={36}
                height={36}
                className="h-9 w-auto shrink-0 object-contain"
              />
              <SiteWordmark className="h-6 w-auto shrink-0 text-foreground md:h-7" />
              <span className="sr-only">{siteConfig.name}</span>
            </Link>
            <p className="mt-1 max-w-md text-sm text-muted">{siteConfig.description}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <Link href="/about" className="hover:text-primary">
              关于我们
            </Link>
            <Link href="/cookies" className="hover:text-primary">
              Cookie 说明
            </Link>
            <a
              href={`mailto:hello@${new URL(siteConfig.url).host}`}
              className="hover:text-primary"
            >
              联系
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted md:text-left">
          © {year} {siteConfig.name} · {siteConfig.url.replace(/^https?:\/\//, "")}
          <span className="mx-2" aria-hidden>
            ·
          </span>
          Powered by{" "}
          <a
            href="https://gansa.top"
            className="font-medium text-muted underline-offset-4 hover:text-primary hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            GanSa Tech.
          </a>{" "}
          干撒科技
        </p>
      </div>
    </footer>
  );
}
