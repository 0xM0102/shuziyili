import Link from "next/link";
import { NewsThumbnail } from "@/components/news/news-thumbnail";
import type { NewsItem } from "@/lib/news-api";
import { prepareNewsBodyHtml } from "@/lib/news-html";
import {
  newsArticleBodyClassName,
  newsArticleContentClassName,
  newsArticleHeroClassName,
} from "@/lib/news-layout";

const backLinkClassName =
  "inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-black/35 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-black/50";

const originalLinkClassName =
  "inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90";

type HeroProps = { item: NewsItem; byline: string };

/** 详情顶区：封面/占位、返回列表、标题与元信息。 */
export function NewsArticleHero({ item, byline }: HeroProps) {
  return (
    <section className={newsArticleHeroClassName}>
      <NewsThumbnail thumbnailUrl={item.thumbnailUrl} variant="hero" />
      <div className="absolute inset-0 bg-black/40" aria-hidden />
      <div className="absolute left-4 top-4 z-10 md:left-6 md:top-6">
        <Link href="/news" className={backLinkClassName}>
          <span aria-hidden>←</span>
          返回资讯列表
        </Link>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/35 to-transparent p-4 md:p-6">
        <h1 className="text-xl font-bold text-white md:text-2xl">{item.title}</h1>
        {byline ? <p className="mt-2 text-xs text-white/90 md:text-sm">{byline}</p> : null}
      </div>
    </section>
  );
}

type MainProps = {
  bodyHtml: string;
  originalUrl: string;
  attribution: string;
};

/** 详情正文区：上游 HTML、原文链接、数据来源说明。 */
export function NewsArticleMain({ bodyHtml, originalUrl, attribution }: MainProps) {
  const preparedHtml = bodyHtml ? prepareNewsBodyHtml(bodyHtml) : "";

  return (
    <section className={newsArticleContentClassName}>
      {preparedHtml ? (
        <article
          className={newsArticleBodyClassName}
          dangerouslySetInnerHTML={{ __html: preparedHtml }}
        />
      ) : (
        <p className="text-sm leading-relaxed text-foreground/90">
          暂无正文片段。完整报道请查看原文链接（第三方页面）。
        </p>
      )}
      {originalUrl ? (
        <a href={originalUrl} target="_blank" rel="noopener noreferrer" className={originalLinkClassName}>
          阅读原文
        </a>
      ) : null}
      {attribution ? (
        <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted">{attribution}</p>
      ) : null}
    </section>
  );
}
