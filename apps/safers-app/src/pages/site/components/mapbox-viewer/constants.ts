export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

export const MODEL_URL = "/assets/models/sample.glb";

export const MODEL_LNG_LAT: [number, number] = [126.8469, 37.499386];

export const INITIAL_VIEW = {
  center: MODEL_LNG_LAT,
  zoom: 18,
  pitch: 60,
  bearing: 120,
} as const;

export const MAP_STYLES = {
  day: "mapbox://styles/pluxity-nadk/cmlhclxv7000w01sk3ag994v4",
  mono: "mapbox://styles/pluxity-nadk/cmlhcizfs000801sp7y4hd6eu",
  night: "mapbox://styles/pluxity-nadk/cmlhbbwia000501sp8rbz247b",
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

// ── Three.js 색상 (hex) ──

export const COLOR_SUCCESS = 0x00c48c;
export const COLOR_DANGER = 0xde4545;

// ── 에셋 경로 ──

export const ASSET_URLS = {
  worker: "/assets/models/worker_walk.glb",
  workerStunned: "/assets/models/worker_stunned.glb",
  cctv: "/assets/models/cctv.glb",
} as const;

// ── 비상 카메라 설정 ──

export const EMERGENCY_CAMERA = {
  BASE_ZOOM: 20.5,
  BASE_ALT: 11.9,
  BEARING: 120,
  PITCH: 45.5,
} as const;

// ── 건물 투명도 ──

export const BUILDING_OPACITY = {
  FULL: 1.0,
  OCCLUDED: 0.15,
} as const;

// ── 애니메이션 기본값 ──

export const DEFAULT_FLY_DURATION = 2000;

// ── FOV 메시 기본값 ──

export const FOV_DEFAULTS = {
  OPACITY: 0.15,
  GRID_COLS: 24,
  GRID_ROWS: 14,
} as const;

// ── 팝업 오프셋 (머리 위 높이, m) ──

export const POPUP_HEAD_OFFSET = 2;

// ── 배너 기본 메시지 ──

export const DEFAULT_BANNER_MESSAGE = "이상징후 감지";
