export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

export const MAP_STYLES = {
  day: import.meta.env.VITE_MAPBOX_STYLE_DAY as string,
  mono: import.meta.env.VITE_MAPBOX_STYLE_MONO as string,
  night: import.meta.env.VITE_MAPBOX_STYLE_NIGHT as string,
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

export const COLOR_SUCCESS = 0x00c48c;
export const COLOR_DANGER = 0xde4545;

export const ASSET_URLS = {
  worker: "/assets/models/worker_working.glb",
  workerWalk: "/assets/models/worker_walk.glb",
  workerStunned: "/assets/models/worker_stunned.glb",
  cctv: "/assets/models/cctv.glb",
} as const;

export const BUILDING_OPACITY = {
  FULL: 1.0,
  DEFAULT: 0.8,
  OCCLUDED: 0.15,
} as const;

export const DEFAULT_FLY_DURATION = 2000;

export const FOV_DEFAULTS = {
  OPACITY: 0.15,
  GRID_COLS: 24,
  GRID_ROWS: 14,
} as const;

export const POPUP_HEAD_OFFSET = 0.5;

export const DEFAULT_BANNER_MESSAGE = "이상징후 감지";

export const CLIP_FLOOR_MARGIN = -1;

export const CLIP_OUTLINE_COLOR: Record<MapStyleKey, string> = {
  day: "rgba(255, 0, 0, 0.9)",
  mono: "rgba(255, 0, 0, 0.9)",
  night: "rgba(255, 230, 0, 1)",
};
