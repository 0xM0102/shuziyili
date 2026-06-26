import type { Metadata } from "next";
import { ChannelPlaceholderPage } from "@/components/layout/channel-placeholder-page";

export const travelSubpages = {
  attractions: {
    title: "景点",
    canonical: "/travel/attractions",
    description: "草原、湖泊、街区和摄影点会集中在这里。先从旅游总览了解当季重点，再按攻略安排路线。",
    actions: [
      { href: "/travel", label: "回到旅游总览", variant: "primary" as const },
      { href: "/travel/guide", label: "先看攻略" },
    ],
  },
  food: {
    title: "美食",
    canonical: "/travel/food",
    description: "本地味、夜市、咖啡和适合短住者的日常餐食会集中在这里，方便按街区安排一天的动线。",
    actions: [
      { href: "/travel", label: "回到旅游总览", variant: "primary" as const },
      { href: "/convenience", label: "看便民黄页" },
    ],
  },
  guide: {
    title: "攻略",
    canonical: "/travel/guide",
    description: "把路线、季节、预算、交通和住宿放在一起看，适合出发前快速确认计划。",
    actions: [
      { href: "/travel", label: "回到旅游总览", variant: "primary" as const },
      { href: "/news", label: "看最新资讯" },
    ],
  },
  stay: {
    title: "住宿",
    canonical: "/travel/stay",
    description: "按街区、通勤、安静程度和生活便利度来选择短住位置，适合旅游、短居和远程办公一起规划。",
    actions: [
      { href: "/travel", label: "回到旅游总览", variant: "primary" as const },
      { href: "/nomad#stay", label: "看数字游民住宿" },
    ],
  },
  transport: {
    title: "交通",
    canonical: "/travel/transport",
    description: "机场、高铁、市内通勤、租车和自驾补给会集中在这里，先按目的地确认时间和换乘。",
    actions: [
      { href: "/travel", label: "回到旅游总览", variant: "primary" as const },
      { href: "/travel/attractions", label: "看景点方向" },
    ],
  },
} as const;

export type TravelSubpageSlug = keyof typeof travelSubpages;

export function buildTravelSubpageMetadata(slug: TravelSubpageSlug): Metadata {
  const page = travelSubpages[slug];
  return {
    title: page.title,
    description: `伊犁${page.title}信息。`,
    alternates: { canonical: page.canonical },
  };
}

export function createTravelSubpage(slug: TravelSubpageSlug) {
  const page = travelSubpages[slug];
  return {
    metadata: buildTravelSubpageMetadata(slug),
    Page: function TravelSubpage() {
      return (
        <ChannelPlaceholderPage
          title={page.title}
          description={page.description}
          actions={[...page.actions]}
        />
      );
    },
  };
}
