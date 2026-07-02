import Link from "next/link";
import type { ReactNode } from "react";
import { SectionHead } from "@/components/layout/section-head";
import { NewsThumbnail } from "@/components/news/news-thumbnail";
import {
  buildAreaNewsTags,
  type HomeAreaNewsItem,
  type HomeAreaNewsTag,
} from "@/lib/home-area-news";
import { formatNewsListDateLine } from "@/lib/news-display";

type Props = {
  regionName: string;
  items: HomeAreaNewsItem[];
};

const ROW_LINK_CLASS =
  "group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-sidebar-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40";
const THUMB_SHELL_CLASS =
  "relative h-[72px] w-[108px] shrink-0 overflow-hidden rounded-lg bg-muted md:h-[80px] md:w-[128px]";
const TITLE_CLASS =
  "line-clamp-2 text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary md:text-base";

const TAG_CLASS: Record<HomeAreaNewsTag["kind"], string> = {
  region: "rounded-md bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary",
  source:
    "rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground/90",
};

function AreaNewsTag({ tag }: { tag: HomeAreaNewsTag }) {
  return <span className={TAG_CLASS[tag.kind]}>{tag.label}</span>;
}

function AreaNewsRowLink({ href, children }: { href: string | undefined; children: ReactNode }) {
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={ROW_LINK_CLASS}>
        {children}
      </a>
    );
  }
  return (
    <Link href="/news" className={ROW_LINK_CLASS}>
      {children}
    </Link>
  );
}

function NewsRow({ item }: { item: HomeAreaNewsItem }) {
  const dateLine = formatNewsListDateLine(item.date);
  const tags = buildAreaNewsTags(item);
  const href = item.url.trim() || undefined;

  return (
    <li>
      <AreaNewsRowLink href={href}>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {dateLine ? <p className="text-xs text-muted">{dateLine}</p> : null}
          <h3 className={TITLE_CLASS}>{item.title}</h3>
          {item.summary ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted">{item.summary}</p>
          ) : null}
          {tags.length > 0 ? (
            <div className="mt-0.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <AreaNewsTag key={`${tag.kind}-${tag.label}`} tag={tag} />
              ))}
            </div>
          ) : null}
        </div>
        <div className={THUMB_SHELL_CLASS}>
          <NewsThumbnail thumbnailUrl={item.thumbnailUrl} variant="list" />
        </div>
      </AreaNewsRowLink>
    </li>
  );
}

/** 首页「数伊精选」下方的天聚地区资讯列表。 */
export function HomeAreaNewsBlock({ regionName, items }: Props) {
  return (
    <div className="border-t border-border bg-background p-4 md:p-5">
      <SectionHead title={`${regionName}资讯`} moreHref="/news" dotTone="warm" />
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          暂无{regionName}地区资讯。请在 API 配置中启用天聚数行地区新闻（TIANAPI_NEWS_ENABLED）。
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <NewsRow key={item.uniquekey} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
