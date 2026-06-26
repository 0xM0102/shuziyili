import type { NavIconName } from "@/components/icons/nav-icons";

export type ConvenienceCategorySlug = string;

export type ConvenienceServiceStatus = "common" | "external" | "pending" | "verified";

export type ConvenienceCategory = {
  slug: ConvenienceCategorySlug;
  title: string;
  shortTitle: string;
  description: string;
  icon: NavIconName;
  keywords: string[];
};

export type ConvenienceService = {
  id: string;
  title: string;
  category: ConvenienceCategorySlug;
  area: string;
  address: string;
  contact: string;
  hours: string;
  summary: string;
  tags: string[];
  status: ConvenienceServiceStatus;
  sourceUrl?: string;
  mapUrl?: string;
  emergency?: boolean;
};

type DraftServiceInput = Omit<ConvenienceService, "contact" | "hours" | "status"> &
  Partial<Pick<ConvenienceService, "contact" | "hours">>;

type ExternalServiceInput = Omit<
  ConvenienceService,
  "address" | "contact" | "hours" | "status"
> &
  Partial<Pick<ConvenienceService, "address">> & { sourceUrl: string };

function draftService(input: DraftServiceInput): ConvenienceService {
  return {
    contact: "待核实",
    hours: "待核实",
    status: "pending",
    ...input,
  };
}

function externalService(input: ExternalServiceInput): ConvenienceService {
  return {
    address: "外部分类信息平台",
    contact: "查看来源页面",
    hours: "实时发布，以来源页面为准",
    status: "external",
    ...input,
  };
}

export const convenienceCategories: ConvenienceCategory[] = [
  {
    slug: "government",
    title: "政务便民",
    shortTitle: "政务",
    description: "证件、社保、公积金、公共服务和办事咨询入口。",
    icon: "government",
    keywords: ["政务", "证件", "社保", "公积金", "办事", "12345"],
  },
  {
    slug: "health",
    title: "医疗健康",
    shortTitle: "医疗",
    description: "医院、药店、急诊、医保和日常健康服务。",
    icon: "health",
    keywords: ["医院", "药店", "急诊", "医保", "120"],
  },
  {
    slug: "shipping",
    title: "快递物流",
    shortTitle: "快递",
    description: "寄件、取件、大件物流和短住收货建议。",
    icon: "shipping",
    keywords: ["快递", "物流", "寄件", "取件", "顺丰", "菜鸟"],
  },
  {
    slug: "transport",
    title: "交通出行",
    shortTitle: "交通",
    description: "公交、客运、出租、停车、道路救援和事故报警。",
    icon: "transport",
    keywords: ["公交", "客运", "出租", "停车", "122", "救援"],
  },
  {
    slug: "telecom",
    title: "通信网络",
    shortTitle: "通信",
    description: "电话卡、宽带、营业厅和远程办公网络保障。",
    icon: "telecom",
    keywords: ["电话卡", "宽带", "移动", "联通", "电信", "网络"],
  },
  {
    slug: "banking",
    title: "银行缴费",
    shortTitle: "银行",
    description: "银行网点、取现、生活缴费和账户咨询。",
    icon: "banking",
    keywords: ["银行", "缴费", "取现", "账户", "网点"],
  },
  {
    slug: "shopping",
    title: "生活采购",
    shortTitle: "采购",
    description: "超市、菜市场、药妆、日用品和长期居住补给。",
    icon: "shopping",
    keywords: ["超市", "菜市场", "日用品", "采购", "补给"],
  },
  {
    slug: "repair",
    title: "维修家政",
    shortTitle: "维修",
    description: "水电燃气、开锁、家电、电脑和上门维修。",
    icon: "repair",
    keywords: ["维修", "家政", "水电", "开锁", "家电", "电脑"],
  },
  {
    slug: "emergency",
    title: "应急电话",
    shortTitle: "应急",
    description: "报警、急救、消防、交通事故和紧急求助。",
    icon: "emergency",
    keywords: ["报警", "急救", "消防", "应急", "110", "119", "120"],
  },
  {
    slug: "community",
    title: "社区服务",
    shortTitle: "社区",
    description: "社区咨询、物业、健身、公益和本地生活服务。",
    icon: "community",
    keywords: ["社区", "物业", "健身", "公益", "生活服务"],
  },
];

export const convenienceServices: ConvenienceService[] = [
  {
    id: "public-hotline-12345",
    title: "政务服务便民热线",
    category: "government",
    area: "全州",
    address: "线上咨询",
    contact: "12345",
    hours: "全天候受理，以当地接线规则为准",
    summary: "适合咨询政务办事、公共服务、投诉建议和跨部门问题。",
    tags: ["政务咨询", "公共服务", "投诉建议"],
    status: "common",
  },
  {
    id: "social-security-12333",
    title: "人社服务咨询",
    category: "government",
    area: "全州",
    address: "线上咨询",
    contact: "12333",
    hours: "以当地接线时间为准",
    summary: "社保、就业、劳动关系等问题可先通过热线确认办理路径。",
    tags: ["社保", "就业", "劳动"],
    status: "common",
  },
  {
    id: "medical-emergency-120",
    title: "医疗急救",
    category: "health",
    area: "全州",
    address: "紧急情况请说明当前位置",
    contact: "120",
    hours: "全天候",
    summary: "突发疾病、外伤等紧急情况优先拨打急救电话。",
    tags: ["急救", "医疗", "应急"],
    status: "common",
  },
  draftService({
    id: "night-pharmacy-directory",
    title: "夜间药店信息",
    category: "health",
    area: "伊宁市及周边",
    address: "待运营补充具体门店",
    summary: "用于沉淀夜间营业药店、常用药购买和附近药房信息。",
    tags: ["药店", "夜间", "待补充"],
  }),
  draftService({
    id: "express-pickup-directory",
    title: "快递寄件取件网点",
    category: "shipping",
    area: "伊宁市及周边",
    address: "待运营补充网点",
    summary: "适合整理顺丰、京东、菜鸟、三通一达等常用网点。",
    tags: ["寄件", "取件", "网点"],
  }),
  draftService({
    id: "large-logistics-directory",
    title: "大件物流与设备托运",
    category: "shipping",
    area: "伊犁州",
    address: "待运营补充站点",
    summary: "面向搬家、办公设备、摄影器材等大件寄送场景。",
    tags: ["大件", "搬家", "设备"],
  }),
  {
    id: "traffic-accident-122",
    title: "道路交通事故报警",
    category: "transport",
    area: "全州",
    address: "紧急情况请说明当前位置",
    contact: "122",
    hours: "全天候",
    summary: "交通事故、道路突发情况可优先拨打交通事故报警电话。",
    tags: ["交通", "事故", "报警"],
    status: "common",
  },
  draftService({
    id: "passenger-transport-directory",
    title: "客运与公交咨询",
    category: "transport",
    area: "伊宁市及周边",
    address: "待运营补充站点",
    summary: "用于汇总客运站、公交线路、机场/火车站接驳等信息。",
    tags: ["公交", "客运", "接驳"],
  }),
  externalService({
    id: "ylnet-carpool",
    title: "绿河谷巴扎拼车信息",
    category: "transport",
    area: "伊犁州",
    summary: "可查看人找车、车找人、顺风车等本地拼车信息；具体电话、时间和路线请以发布页为准。",
    tags: ["拼车", "顺风车", "外部来源"],
    sourceUrl: "https://bz.ylnet.com.cn/category-catid-294.html",
  }),
  {
    id: "telecom-hotlines",
    title: "三大运营商客服",
    category: "telecom",
    area: "全州",
    address: "线上咨询",
    contact: "10086 / 10010 / 10000",
    hours: "以运营商规则为准",
    summary: "电话卡、流量、宽带、漫游和信号问题可先联系运营商客服。",
    tags: ["移动", "联通", "电信"],
    status: "common",
  },
  draftService({
    id: "coworking-network-help",
    title: "远程办公网络保障",
    category: "telecom",
    area: "伊宁市及周边",
    address: "待运营补充办公点",
    summary: "沉淀适合视频会议、稳定 WiFi、插座充足的办公点和网络建议。",
    tags: ["远程办公", "WiFi", "电话卡"],
  }),
  draftService({
    id: "bank-branch-directory",
    title: "银行网点与生活缴费",
    category: "banking",
    area: "伊宁市及周边",
    address: "待运营补充网点",
    summary: "用于整理银行网点、ATM、社保卡、生活缴费和线下账户咨询。",
    tags: ["银行", "ATM", "缴费"],
  }),
  draftService({
    id: "daily-market-directory",
    title: "超市与菜市场",
    category: "shopping",
    area: "伊宁市及周边",
    address: "待运营补充地点",
    summary: "面向长期居住、短租和数字游民的一周生活补给目录。",
    tags: ["超市", "菜市场", "补给"],
  }),
  draftService({
    id: "repair-home-service",
    title: "水电维修与家政",
    category: "repair",
    area: "伊宁市及周边",
    address: "待运营补充商家",
    summary: "用于整理租房常见维修、保洁、家电和电脑设备维修服务。",
    tags: ["维修", "家政", "租房"],
  }),
  externalService({
    id: "ylnet-life-services",
    title: "绿河谷巴扎生活服务",
    category: "repair",
    area: "伊犁州",
    summary: "生活服务分类包含家政、保洁、搬家、家电维修、电脑维修、管道疏通、开锁、租车等本地发布信息。",
    tags: ["生活服务", "家政维修", "外部来源"],
    sourceUrl: "https://bz.ylnet.com.cn/category-catid-9.html",
  }),
  {
    id: "police-110",
    title: "报警求助",
    category: "emergency",
    area: "全州",
    address: "紧急情况请说明当前位置",
    contact: "110",
    hours: "全天候",
    summary: "遇到人身安全、治安或紧急求助问题时使用。",
    tags: ["报警", "求助", "安全"],
    status: "common",
  },
  {
    id: "fire-119",
    title: "消防救援",
    category: "emergency",
    area: "全州",
    address: "紧急情况请说明当前位置",
    contact: "119",
    hours: "全天候",
    summary: "火灾、抢险救援等紧急情况优先拨打消防电话。",
    tags: ["消防", "救援", "火警"],
    status: "common",
  },
  draftService({
    id: "community-service-directory",
    title: "社区与物业服务",
    category: "community",
    area: "伊宁市及周边",
    address: "待运营补充社区/物业",
    summary: "用于沉淀社区咨询、物业报修、健身房和公益服务信息。",
    tags: ["社区", "物业", "健身"],
  }),
  externalService({
    id: "ylnet-house-rental",
    title: "绿河谷巴扎房屋租售",
    category: "community",
    area: "伊犁州",
    summary: "可查看房屋出租、求租、出售、商铺、写字楼等本地发布信息；适合作为租住线索入口。",
    tags: ["租房", "商铺", "外部来源"],
    sourceUrl: "https://bz.ylnet.com.cn/category-catid-3.html",
  }),
];

export const convenienceCategorySlugs = convenienceCategories.map((item) => item.slug);

export const convenienceStatusLabel: Record<ConvenienceServiceStatus, string> = {
  common: "常用入口",
  external: "外部平台",
  pending: "待核实",
  verified: "已核验",
};

export function buildConvenienceCategoryHref(slug: ConvenienceCategorySlug) {
  return `/convenience/${slug}`;
}

export function getConvenienceCategory(
  slug: string,
  categories: ConvenienceCategory[] = convenienceCategories
): ConvenienceCategory | undefined {
  return categories.find((item) => item.slug === slug);
}

export function getConvenienceServicesByCategory(
  slug: ConvenienceCategorySlug,
  services: ConvenienceService[] = convenienceServices
) {
  return services.filter((item) => item.category === slug);
}

export function getEmergencyConvenienceServices(
  services: ConvenienceService[] = convenienceServices
) {
  const priorityIds = [
    "medical-emergency-120",
    "police-110",
    "fire-119",
    "traffic-accident-122",
    "public-hotline-12345",
  ];
  const configured = services.filter((item) => item.emergency);
  if (configured.length > 0) return configured;
  return priorityIds
    .map((id) => services.find((item) => item.id === id))
    .filter((item): item is ConvenienceService => Boolean(item));
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export function filterConvenienceServices(
  query: string,
  categories: ConvenienceCategory[] = convenienceCategories,
  services: ConvenienceService[] = convenienceServices
) {
  const keyword = normalizeText(query);
  if (!keyword) return services;

  return services.filter((item) => {
    const category = getConvenienceCategory(item.category, categories);
    const haystack = [
      item.title,
      item.area,
      item.address,
      item.contact,
      item.hours,
      item.summary,
      item.sourceUrl ?? "",
      ...item.tags,
      category?.title ?? "",
      ...(category?.keywords ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(keyword);
  });
}
