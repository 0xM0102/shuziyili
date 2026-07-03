import type { Map as LeafletMap, Marker } from "leaflet";
import { buildCheckpointTooltipHtml } from "@/lib/travel-spots/checkpoint-utils";
import type { TravelCheckpoint, TravelSpotMapConfig } from "@/lib/travel-spots/types";

export const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const PIN_SIZE = 28;
const PIN_ANCHOR = PIN_SIZE / 2;
const MAP_FIT_PADDING: [number, number] = [40, 40];

type LeafletModule = typeof import("leaflet");

function createPinIcon(L: LeafletModule, order: number) {
  return L.divIcon({
    html: `<div class="travel-spot-pin">${order}</div>`,
    className: "",
    iconSize: [PIN_SIZE, PIN_SIZE],
    iconAnchor: [PIN_ANCHOR, PIN_ANCHOR],
  });
}

function createCheckpointMarker(L: LeafletModule, checkpoint: TravelCheckpoint): Marker {
  const marker = L.marker(checkpoint.position, {
    icon: createPinIcon(L, checkpoint.order),
    title: checkpoint.name,
  });

  marker.bindTooltip(buildCheckpointTooltipHtml(checkpoint), {
    direction: "top",
    offset: [0, -12],
    opacity: 1,
    sticky: true,
    className: "travel-spot-tooltip-pane",
  });

  return marker;
}

/** 在容器内挂载 Leaflet 地图并渲染打卡点，调用方负责 destroy。 */
export function mountTravelSpotMap(
  L: LeafletModule,
  container: HTMLElement,
  config: TravelSpotMapConfig,
): LeafletMap {
  const map = L.map(container, {
    center: config.center,
    zoom: config.zoom,
    scrollWheelZoom: true,
  });

  L.tileLayer(OSM_TILE_URL, {
    attribution: OSM_ATTRIBUTION,
    maxZoom: 19,
  }).addTo(map);

  const markers = config.checkpoints.map((checkpoint) => {
    const marker = createCheckpointMarker(L, checkpoint);
    marker.addTo(map);
    return marker;
  });

  if (markers.length > 0) {
    const bounds = L.latLngBounds(markers.map((marker) => marker.getLatLng()));
    map.fitBounds(bounds, { padding: MAP_FIT_PADDING });
  }

  return map;
}
