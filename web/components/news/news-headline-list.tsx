import Link from "next/link";
import { NewsThumbnail } from "@/components/news/news-thumbnail";
import { buildNewsArticleHref, type NewsChannelType, type NewsItem } from "@/lib/news-api";
import { formatNewsByline } from "@/lib/news-display";

const rowLinkClassName =
  "group grid grid-cols-1 gap-0 transition-colors hover:bg-sidebar-hover md:grid-cols-[minmax(0,140px)_1fr]";
const thumbShellClassName =
  "relative aspect-16/10 w-full shrink-0 bg-muted md:aspect-auto md:min-h-[120px] md:max-h-[140px]";
const textCellClassName =
  "flex min-w-0 flex-col justify-center gap-2 px-4 py-4 md:gap-2.5 md:px-5 md:py-5";
const titleClassName =
  "line-clamp-2 text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary md:text-base";

function HeadlineRow({ channelType, item }: { channelType?: NewsChannelType; item: NewsItem }) {
  const href = buildNewsArticleHref(item.uniquekey, channelType);
  const byline = formatNewsByline(item, { includeCategory: true });

  return (
    <Link href={href} className={rowLinkClassName}>
      <div className={thumbShellClassName}>
        <NewsThumbnail thumbnailUrl={item.thumbnailUrl} variant="list" />
      </div>
      <div className={textCellClassName}>
        <h2 className={titleClassName}>{item.title}</h2>
        <p className="text-xs text-muted">{byline}</p>
      </div>
    </Link>
  );
}

export function NewsHeadlineList({
  channelType,
  items,
}: {
  channelType?: NewsChannelType;
  items: NewsItem[];
}) {
  return (
    <section className="border-y border-border" aria-label="资讯列表">
      <ul className="divide-y divide-border">
        {items.map((it) => (
          <li key={it.uniquekey}>
            <HeadlineRow item={it} channelType={channelType} />
          </li>
        ))}
      </ul>
    </section>
  );
}
