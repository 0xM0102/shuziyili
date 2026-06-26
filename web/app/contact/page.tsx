import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  standaloneContentGridClassName,
  standaloneHeaderClassName,
  standaloneSideRailClassName,
  standaloneWidePageClassName,
} from "@/lib/page-layout";
import { siteConfig } from "@/lib/site";

const contactEmail = `hello@${new URL(siteConfig.url).host}`;
const mailtoHello = `mailto:${contactEmail}`;

export const metadata: Metadata = {
  title: "联系我们",
  description: `${siteConfig.name} 的内容纠错、合作咨询与产品反馈入口。`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `联系我们 · ${siteConfig.name}`,
    description: `${siteConfig.name} 的内容纠错、合作咨询与产品反馈入口。`,
    url: "/contact",
  },
};

type ContactItemProps = {
  tag: string;
  title: string;
  children: ReactNode;
};

function ContactItem({ tag, title, children }: ContactItemProps) {
  return (
    <li className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary sm:mt-0.5">
          {tag}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
          <div className="mt-2 text-sm leading-relaxed text-muted">{children}</div>
        </div>
      </div>
    </li>
  );
}

export default function ContactPage() {
  return (
    <div className={standaloneWidePageClassName}>
      <header className={`${standaloneHeaderClassName} border-b border-border pb-8 md:pb-10`}>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          联系入口
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          联系我们
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          如果您有内容纠错、活动发布、空间合作、商家入驻或产品反馈，可以从这里联系数字伊犁团队。请尽量带上页面链接、问题描述和可核验的信息来源。
        </p>
      </header>

      <div className={`mt-10 ${standaloneContentGridClassName}`}>
        <section className="space-y-5" aria-labelledby="contact-topics">
          <h2 id="contact-topics" className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
            可以联系什么
          </h2>
          <ul className="space-y-4">
            <ContactItem tag="改" title="内容纠错">
              文章、活动、旅游、便民信息若有地址、时间、电话、价格或政策变化，欢迎提供更新线索。
            </ContactItem>
            <ContactItem tag="活" title="活动与社区">
              Meetup、分享会、市集、徒步、摄影、创业交流等活动，可以联系本站做信息整理与入口展示。
            </ContactItem>
            <ContactItem tag="商" title="商家与空间">
              咖啡馆、民宿、共享办公、文旅空间、生活服务商家，如适合数字游民或本地生活场景，可以提交合作意向。
            </ContactItem>
            <ContactItem tag="建" title="产品反馈">
              如果您发现页面体验、搜索、报名、登录或移动端布局问题，也欢迎把设备、浏览器和复现路径一起发来。
            </ContactItem>
          </ul>
        </section>

        <aside className={standaloneSideRailClassName}>
          <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground">邮箱联系</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              推荐使用邮件发送较完整的说明，我们会在能力范围内尽快查看。
            </p>
            <p className="mt-5">
              <a
                href={mailtoHello}
                className="inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                发送邮件至 {contactEmail}
              </a>
            </p>
          </section>

          <section className="rounded-2xl border border-dashed border-border bg-sidebar/50 p-6 md:p-8">
            <h2 className="text-lg font-semibold text-foreground">查看站点说明</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              如果您想了解本站定位、服务范围与免责声明，可以先阅读关于我们页面。
            </p>
            <p className="mt-5">
              <Link
                href="/about"
                className="inline-flex items-center rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground/90 transition-colors hover:bg-sidebar-hover"
              >
                关于我们
              </Link>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
