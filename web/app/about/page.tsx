import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/site";

const mailtoHello = `mailto:hello@${new URL(siteConfig.url).host}`;

export const metadata: Metadata = {
  title: "关于我们",
  description: `${siteConfig.name} 的定位、服务范围与使用说明。`,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `关于我们 · ${siteConfig.name}`,
    description: `${siteConfig.name} 的定位、服务范围与使用说明。`,
    url: "/about",
  },
};

type ItemProps = {
  tag: string;
  title: string;
  children: ReactNode;
};

function InfoItem({ tag, title, children }: ItemProps) {
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

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24 md:px-6 md:py-10 md:pb-28">
      <header className="border-b border-border pb-8 md:pb-10">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          站点说明
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          关于我们
        </h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
          {siteConfig.name}（{siteConfig.url.replace(/^https?:\/\//, "")}
          ）面向伊犁哈萨克自治州及周边地区，聚合本地资讯、活动、旅游、便民与数字游民等内容，帮助您更高效地获取信息、发现服务与参与本地生活。
        </p>
      </header>

      <div className="mt-10 space-y-10">
        <section className="space-y-5">
          <h2 className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
            我们提供什么
          </h2>
          <ul className="space-y-4">
            <InfoItem tag="讯" title="资讯与活动">
              汇集本地热点与活动信息，便于浏览与检索。您可从{" "}
              <Link href="/news" className="font-medium text-primary underline-offset-4 hover:underline">
                资讯
              </Link>{" "}
              与{" "}
              <Link href="/events" className="font-medium text-primary underline-offset-4 hover:underline">
                活动
              </Link>{" "}
              栏目进入相关内容。
            </InfoItem>
            <InfoItem tag="游" title="旅游与出行">
              提供景点、食宿、交通与游玩指南等结构化入口，帮助规划行程与了解本地。详见{" "}
              <Link href="/travel" className="font-medium text-primary underline-offset-4 hover:underline">
                旅游
              </Link>{" "}
              频道。
            </InfoItem>
            <InfoItem tag="便" title="便民服务">
              整理常用便民分类与热点入口，缩短查找路径。详见{" "}
              <Link href="/convenience" className="font-medium text-primary underline-offset-4 hover:underline">
                便民
              </Link>{" "}
              频道。
            </InfoItem>
            <InfoItem tag="民" title="数字游民">
              面向远程工作与短住人群，提供选址、空间与生活方式等参考内容，见{" "}
              <Link href="/nomad" className="font-medium text-primary underline-offset-4 hover:underline">
                数字游民
              </Link>{" "}
              栏目。
            </InfoItem>
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
            体验与账号
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            本站支持浅色 / 深色主题与界面语言等偏好设置；若您使用登录或账号相关功能，我们会按合规要求处理会话与安全所需的数据。关于浏览器中的 Cookie 与本地存储，请参阅{" "}
            <Link href="/cookies" className="font-medium text-primary underline-offset-4 hover:underline">
              Cookie 说明
            </Link>
            。
          </p>
        </section>

        <section className="space-y-5">
          <h2 className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
            重要说明
          </h2>
          <ul className="space-y-4">
            <InfoItem tag="性" title="站点性质">
              {siteConfig.name}
              为民间信息服务平台，与任何政府机关、事业单位无隶属或代言关系；名称中的地域称谓仅表示服务覆盖范围与内容主题。
            </InfoItem>
            <InfoItem tag="准" title="信息准确性">
              本站展示的文章、活动、地点与第三方链接等信息，均力求及时与准确，但仍可能因更新滞后或来源差异而存在偏差。涉及票价、营业时间、政策与法规等事项，请以权威部门、场馆或服务机构最新发布为准。
            </InfoItem>
            <InfoItem tag="责" title="内容与责任">
              用户或合作方发布的内容（如有）仅代表作者或提供方观点，不代表本站立场。您因使用本站信息所作出的决策与后果，请自行判断并承担相应风险。
            </InfoItem>
          </ul>
        </section>

        <section className="rounded-2xl border border-dashed border-border bg-sidebar/50 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-foreground">联系我们</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            若您有关于内容纠错、合作意向或产品反馈，欢迎通过邮件与我们联系。我们会在能力范围内尽快回复。
          </p>
          <p className="mt-4">
            <a
              href={mailtoHello}
              className="inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              发送邮件至 hello@{new URL(siteConfig.url).host}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
