/** WGS-84 坐标：[纬度, 经度]（Leaflet / OpenStreetMap）。 */
export type LatLng = [number, number];

export type TravelCheckpoint = {
  id: string;
  name: string;
  position: LatLng;
  /** 打卡点说明，悬停标记时展示。 */
  hint?: string;
  /** 环湖顺序（从东门起逆时针）。 */
  order: number;
};

export type TravelSpotMapConfig = {
  center: LatLng;
  zoom: number;
  checkpoints: TravelCheckpoint[];
};

export type TravelSpotPage = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  tips: string[];
  map: TravelSpotMapConfig;
};
