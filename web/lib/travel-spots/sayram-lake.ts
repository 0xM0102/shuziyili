import type { TravelSpotPage } from "@/lib/travel-spots/types";

/**
 * 赛里木湖环湖打卡点（WGS-84，与 OpenStreetMap 底图一致）。
 * 有 OSM POI 的取实测坐标；其余按环湖公路走向在湖岸附近估算。
 * 顺序：东门 → 逆时针环湖（与景区常见自驾路线一致）。
 */
export const sayramLakeSpot: TravelSpotPage = {
  slug: "sayram-lake",
  title: "赛里木湖",
  subtitle: "高山蓝宝石 · 环湖自驾",
  summary:
    "赛里木湖位于天山山脉西段，是新疆海拔最高、面积最大的高山湖泊之一。环湖公路全长约 90 公里，沿途可停靠多个观景台与草原湿地，适合 1～2 日自驾或包车慢游。",
  tips: [
    "环湖多为公路观景，注意避让来车并在指定停车区停靠。",
    "夏季紫外线强，备防晒与防风外套；湖区早晚温差大。",
    "旺季东门、点将台一带车流集中，建议尽早出发或错峰。",
  ],
  map: {
    center: [44.60, 81.18],
    zoom: 10,
    checkpoints: [
      {
        id: "east-gate",
        name: "东门游客中心",
        position: [44.601102, 81.390681],
        hint: "主入口，购票与补给集中，环湖常见起点。",
        order: 1,
      },
      {
        id: "santai",
        name: "三台草原",
        position: [44.6285, 81.355],
        hint: "东岸草甸与湖岸相接，夏季野花与牧场景观。",
        order: 2,
      },
      {
        id: "qinshui",
        name: "亲水滩",
        position: [44.683093, 81.209121],
        hint: "湖畔亲水步道，「西域净海」巨石碑与天鹅常出没于此。",
        order: 3,
      },
      {
        id: "dianjiangtai",
        name: "点将台",
        position: [44.688404, 81.066234],
        hint: "成吉思汗点将台遗址，270° 环湖视野，日落热门机位。",
        order: 4,
      },
      {
        id: "west-view",
        name: "西海草原",
        position: [44.577587, 80.989408],
        hint: "西岸草原湿地直通湖面，夏季金莲花与日落取景地。",
        order: 5,
      },
      {
        id: "kele-yongzhu",
        name: "克勒涌珠",
        position: [44.560351, 81.019383],
        hint: "湖湾泉眼涌珠，湖水清澈、气泡上涌的奇观点位。",
        order: 6,
      },
      {
        id: "songshutou",
        name: "松树头",
        position: [44.502571, 81.140929],
        hint: "南岸制高点木栈道，可俯瞰赛湖全景与果子沟大桥。",
        order: 7,
      },
      {
        id: "guozigou",
        name: "果子沟大桥",
        position: [44.479851, 81.158166],
        hint: "出南门顺路打卡，峡谷斜拉桥与赛湖同框的经典机位。",
        order: 8,
      },
    ],
  },
};
