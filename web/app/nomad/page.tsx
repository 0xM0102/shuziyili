import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SectionHead } from "@/components/layout/section-head";
import { fetchPortalEvents } from "@/lib/events-api";
import { formatEventTimeRange, type EventItem } from "@/lib/events-data";
import { standaloneWideContainerClassName } from "@/lib/page-layout";

export const metadata: Metadata = {
  title: "数字游民",
  description: "为准备在伊犁短住、远程办公和探索创业机会的人整理办公、住宿、生活、活动与攻略入口。",
  alternates: { canonical: "/nomad" },
};

type QuickAction = {
  label: string;
  sub: string;
  href: string;
};

type Metric = {
  title: string;
  value: string;
  note: string;
};

type ImageCard = {
  title: string;
  meta: string;
  description: string;
  imageUrl: string;
  tags: string[];
  href: string;
};

type TextCard = {
  title: string;
  meta: string;
  description: string;
  href: string;
};

type Signal = {
  label: string;
  value: string;
  note: string;
};

const heroImage =
  "https://shuziyili-1322855353.cos.ap-chengdu.myqcloud.com/uploads/2026/03/30/e4691bef-e6a6-4930-9e51-5906c01f5f50.png";

const quickActions: QuickAction[] = [
  { label: "找住宿", sub: "先选一个适合久住的街区", href: "#stay" },
  { label: "找办公", sub: "咖啡馆、图书馆、共享空间", href: "#work" },
  { label: "找活动", sub: "Meetup、市集、徒步与分享会", href: "#events" },
  { label: "看攻略", sub: "把一个月生活安排清楚", href: "#guides" },
];

const choiceMetrics: Metric[] = [
  { title: "夏季体感", value: "凉爽", note: "河谷早晚温差明显，适合避暑短住。" },
  { title: "自然环境", value: "高", note: "草原、河谷、雪山与街区生活距离很近。" },
  { title: "生活成本", value: "可控", note: "长期住更适合按街区和通勤半径来选。" },
  { title: "办公网络", value: "成熟", note: "城区 5G、宽带和咖啡馆 Wi-Fi 覆盖较好。" },
  { title: "到达方式", value: "清晰", note: "伊宁机场、高铁与市内交通适合分段规划。" },
  { title: "社区潜力", value: "上升", note: "活动、文旅与创业资源适合慢慢聚合。" },
];

const citySignals: Signal[] = [
  { label: "天气", value: "看温差", note: "早晚温差明显，出门带外套更稳妥" },
  { label: "办公空间", value: "5 个候选", note: "咖啡馆、图书馆、产业园" },
  { label: "近期活动", value: "持续聚合", note: "Meetup、市集、徒步与分享" },
  { label: "最新资讯", value: "精选更新", note: "从资讯频道筛选与生活相关的内容" },
  { label: "市区交通", value: "适合短住", note: "按街区选择通勤半径" },
  { label: "网络状态", value: "城区友好", note: "适合远程办公" },
];

const workspaces: ImageCard[] = [
  {
    title: "六星街咖啡馆群",
    meta: "文艺街区 / 轻办公",
    description: "适合半天处理邮件、约人碰面，也方便把工作和街区漫游连起来。",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    tags: ["Wi-Fi", "咖啡", "街区"],
    href: "/travel/guide",
  },
  {
    title: "伊宁市图书馆",
    meta: "安静 / 专注",
    description: "适合需要稳定专注的工作日，把阅读、写作和材料整理安排在一起。",
    imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
    tags: ["安静", "插座", "阅读"],
    href: "/convenience",
  },
  {
    title: "创业园共享空间",
    meta: "团队 / 创业",
    description: "适合远程团队落地办公、路演沟通和寻找本地产业资源。",
    imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
    tags: ["会议", "入驻", "资源"],
    href: "#startup",
  },
];

const stayAreas: TextCard[] = [
  {
    title: "伊宁市中心",
    meta: "长期住优先",
    description: "生活配套密集，通勤成本低，适合第一次来伊犁试住一个月。",
    href: "/travel/stay",
  },
  {
    title: "六星街周边",
    meta: "街区生活",
    description: "适合喜欢步行、咖啡馆、夜间街区和内容创作的人。",
    href: "/travel/stay",
  },
  {
    title: "喀赞其周边",
    meta: "慢生活体验",
    description: "适合想更深入感受本地生活节奏的人，出行要提前规划。",
    href: "/travel/stay",
  },
  {
    title: "景区短住",
    meta: "周末切换",
    description: "赛里木湖、那拉提、特克斯适合短期切换环境，不建议一开始就重仓。",
    href: "/travel",
  },
];

const livingGuides: TextCard[] = [
  { title: "电话卡", meta: "到达第一天", description: "确认流量套餐、信号覆盖和远程会议需求。", href: "/convenience/telecom" },
  { title: "医疗", meta: "安心底线", description: "先收藏附近医院、药店与夜间急诊信息。", href: "/convenience/health" },
  { title: "快递", meta: "远程工作刚需", description: "办公设备、摄影器材和生活用品需要稳定收发。", href: "/convenience/shipping" },
  { title: "租车", meta: "周末探索", description: "适合周末去草原、湖泊和周边县市。", href: "/travel/transport" },
  { title: "超市", meta: "日常补给", description: "长期住先看步行范围内的超市和菜市场。", href: "/convenience/shopping" },
  { title: "健身房", meta: "保持节奏", description: "远程工作更需要固定运动和作息。", href: "/convenience/community" },
  { title: "银行", meta: "本地支付", description: "处理证件、账户和线下缴费时会用到。", href: "/convenience/banking" },
  { title: "社区活动", meta: "融入城市", description: "从活动开始认识人，比单纯看攻略更快。", href: "/events" },
];

const fallbackEvents: TextCard[] = [
  {
    title: "数字游民 Meetup",
    meta: "交流 / 连接",
    description: "适合第一次到伊犁的人认识同路人，交换办公、住宿与出行经验。",
    href: "/events",
  },
  {
    title: "AI 分享会",
    meta: "技能 / 创业",
    description: "围绕远程协作、AI 工具和本地产业机会做轻量分享。",
    href: "/events",
  },
  {
    title: "周末徒步摄影",
    meta: "自然 / 社交",
    description: "把工作日和周末明确切开，重新找回生活的节奏感。",
    href: "/events",
  },
];

const guides: TextCard[] = [
  {
    title: "为什么越来越多人来到伊犁",
    meta: "城市选择",
    description: "从气候、自然、生活成本和社群潜力理解这座城市。",
    href: "/news",
  },
  {
    title: "伊宁一个月生活成本",
    meta: "预算",
    description: "住宿、餐饮、交通、办公空间和周末出行的拆分清单。",
    href: "/travel/guide",
  },
  {
    title: "数字游民住宿推荐",
    meta: "街区",
    description: "按街区、通勤半径、安静程度和生活便利度来选。",
    href: "/travel/stay",
  },
  {
    title: "咖啡馆办公攻略",
    meta: "办公",
    description: "适合会议、专注写作、轻社交的不同空间怎么选。",
    href: "#work",
  },
  {
    title: "如何在新疆远程办公",
    meta: "准备",
    description: "时差、网络、文件备份、出行节奏和会议安排。",
    href: "/news",
  },
];

const stories: TextCard[] = [
  {
    title: "上海程序员",
    meta: "故事线索",
    description: "在伊宁试住半年，把早会、徒步和咖啡馆办公变成新的日常。",
    href: "/about",
  },
  {
    title: "广州设计师",
    meta: "故事线索",
    description: "从短住开始认识本地街区，后来参与小型空间共创。",
    href: "/about",
  },
  {
    title: "自由摄影师",
    meta: "故事线索",
    description: "边旅行边工作，用影像记录河谷、草原和城市生活。",
    href: "/about",
  },
];

const startupLinks: TextCard[] = [
  { title: "创业政策", meta: "落地", description: "整理适合远程团队和小微创业的政策入口。", href: "/news" },
  { title: "AI 创业", meta: "方向", description: "围绕文旅、内容、本地服务和跨境场景做轻量试验。", href: "/news" },
  { title: "直播基地", meta: "内容电商", description: "连接本地物产、达人和电商服务能力。", href: "/news" },
  { title: "产业园", meta: "空间", description: "适合团队短期驻留、项目路演和资源对接。", href: "#work" },
];

function ActionLink({ item }: { item: QuickAction }) {
  return (
    <Link
      href={item.href}
      className="group flex min-h-24 flex-col justify-between rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-sidebar-hover"
    >
      <span className="text-base font-semibold text-foreground group-hover:text-primary">{item.label}</span>
      <span className="mt-3 text-xs leading-relaxed text-muted">{item.sub}</span>
    </Link>
  );
}

function MetricCard({ item }: { item: Metric }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted">{item.title}</p>
      <p className="mt-3 text-2xl font-semibold tracking-normal text-foreground">{item.value}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.note}</p>
    </article>
  );
}

function SignalCard({ item }: { item: Signal }) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted">{item.label}</p>
      <p className="mt-2 text-base font-semibold text-foreground">{item.value}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{item.note}</p>
    </article>
  );
}

function ImageFeatureCard({ item }: { item: ImageCard }) {
  return (
    <Link
      href={item.href}
      className="group overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary/40 hover:bg-sidebar-hover"
    >
      <div
        className="aspect-[4/3] bg-cover bg-center"
        style={{ backgroundImage: `url(${item.imageUrl})` }}
        aria-hidden
      />
      <div className="p-4">
        <p className="text-xs font-medium text-primary">{item.meta}</p>
        <h3 className="mt-2 text-base font-semibold text-foreground group-hover:text-primary">{item.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{item.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-sidebar-hover px-2 py-1 text-xs text-muted">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function TextFeatureCard({ item }: { item: TextCard }) {
  return (
    <Link
      href={item.href}
      className="group rounded-lg border border-border bg-card p-4 transition hover:border-primary/40 hover:bg-sidebar-hover"
    >
      <p className="text-xs font-medium text-primary">{item.meta}</p>
      <h3 className="mt-2 text-base font-semibold text-foreground group-hover:text-primary">{item.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
    </Link>
  );
}

function SectionShell({
  id,
  title,
  moreHref,
  children,
  className = "bg-background",
}: {
  id?: string;
  title: string;
  moreHref?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`border-b border-border ${className}`}>
      <div className={`${standaloneWideContainerClassName} py-8 md:py-10`}>
        <SectionHead title={title} moreHref={moreHref} />
        <div className="mt-5">{children}</div>
      </div>
    </section>
  );
}

function eventCardsFromApi(events: EventItem[]): TextCard[] {
  const now = Date.now();
  return [...events]
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .filter((event) => new Date(event.endsAt).getTime() >= now)
    .slice(0, 3)
    .map((event) => ({
      title: event.title,
      meta: formatEventTimeRange(event.startsAt, event.endsAt),
      description: event.summary || `${event.location} · ${event.organizer}`,
      href: `/events/${event.id}`,
    }));
}

export default async function YouminPage() {
  const events = await fetchPortalEvents();
  const eventCards = eventCardsFromApi(events);
  const visibleEvents = eventCards.length > 0 ? eventCards : fallbackEvents;

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-background">
        <div
          className="relative min-h-[430px] bg-cover bg-center md:min-h-[520px]"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/35 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
          <div className={`relative flex min-h-[430px] flex-col justify-end pb-8 pt-20 md:min-h-[520px] md:pb-12 ${standaloneWideContainerClassName}`}>
            <p className="text-sm font-semibold text-white/80">数字游民频道</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
              数字游民在伊犁
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/88 md:text-lg">
              在伊犁，一边工作，一边生活。这里为远程工作者、自由职业者和创业者整理办公、住宿、生活、活动和创业指南。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="#work"
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white/90"
              >
                找办公
              </Link>
              <Link
                href="#stay"
                className="rounded-md border border-white/55 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12"
              >
                找住宿
              </Link>
              <Link
                href="/events"
                className="rounded-md border border-white/55 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/12"
              >
                找活动
              </Link>
            </div>
          </div>
        </div>
        <div className={`grid gap-3 py-4 md:grid-cols-4 ${standaloneWideContainerClassName}`}>
          {quickActions.map((item) => (
            <ActionLink key={item.label} item={item} />
          ))}
        </div>
      </section>

      <SectionShell title="为什么选择伊犁">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {choiceMetrics.map((item) => (
            <MetricCard key={item.title} item={item} />
          ))}
        </div>
      </SectionShell>

      <SectionShell title="今日伊犁" className="bg-sidebar-hover">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {citySignals.map((item) => (
            <SignalCard key={item.label} item={item} />
          ))}
        </div>
      </SectionShell>

      <SectionShell id="work" title="办公空间" moreHref="/travel/guide">
        <div className="grid gap-4 md:grid-cols-3">
          {workspaces.map((item) => (
            <ImageFeatureCard key={item.title} item={item} />
          ))}
        </div>
      </SectionShell>

      <SectionShell id="stay" title="住在哪里" className="bg-sidebar-hover" moreHref="/travel/stay">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stayAreas.map((item) => (
            <TextFeatureCard key={item.title} item={item} />
          ))}
        </div>
      </SectionShell>

      <SectionShell title="生活指南" moreHref="/convenience">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {livingGuides.map((item) => (
            <TextFeatureCard key={item.title} item={item} />
          ))}
        </div>
      </SectionShell>

      <SectionShell id="events" title="近期活动" className="bg-sidebar-hover" moreHref="/events">
        <div className="grid gap-3 md:grid-cols-3">
          {visibleEvents.map((item) => (
            <TextFeatureCard key={item.title} item={item} />
          ))}
        </div>
      </SectionShell>

      <SectionShell id="guides" title="精选攻略" moreHref="/news">
        <div className="grid gap-3 md:grid-cols-5">
          {guides.map((item) => (
            <TextFeatureCard key={item.title} item={item} />
          ))}
        </div>
      </SectionShell>

      <SectionShell title="人物故事" className="bg-sidebar-hover">
        <div className="grid gap-3 md:grid-cols-3">
          {stories.map((item) => (
            <TextFeatureCard key={item.title} item={item} />
          ))}
        </div>
      </SectionShell>

      <SectionShell id="startup" title="创业">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {startupLinks.map((item) => (
            <TextFeatureCard key={item.title} item={item} />
          ))}
        </div>
      </SectionShell>

      <section className="bg-foreground text-background">
        <div className={`grid gap-6 py-10 md:grid-cols-[1fr_auto] md:py-12 ${standaloneWideContainerClassName}`}>
          <div>
            <p className="text-sm font-semibold text-background/70">加入数字游民社区</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal md:text-3xl">
              从一场活动开始，认识在伊犁工作和生活的人
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-background/72">
              看城市、选街区、找办公、参加活动、认识社区。把来伊犁一个月会遇到的选择，整理成一条更轻松的路径。
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3 md:justify-end">
            <Link href="/events" className="rounded-md bg-background px-4 py-2 text-sm font-medium text-foreground">
              查看活动
            </Link>
            <Link
              href="/contact"
              className="rounded-md border border-background/45 px-4 py-2 text-sm font-medium text-background"
            >
              联系我们
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
