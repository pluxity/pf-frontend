const MINIO_MODELS = `${import.meta.env.VITE_MINIO_URL}/models`;

export const ASSET_URLS = {
  worker: `${MINIO_MODELS}/assets/worker_working.glb`,
  workerWalk: `${MINIO_MODELS}/assets/worker_walk.glb`,
  workerStunned: `${MINIO_MODELS}/assets/worker_stunned.glb`,
  cctv: `${MINIO_MODELS}/assets/cctv.glb`,
  dump: `${MINIO_MODELS}/assets/Dump.glb`,
  crane01: `${MINIO_MODELS}/assets/Crane_01.glb`,
  crane02: `${MINIO_MODELS}/assets/Crane_02.glb`,
} as const;

export const BUILDING_OPACITY = {
  FULL: 1.0,
  DEFAULT: 0.8,
  OCCLUDED: 0.15,
  FLOOR_XRAY: 0.08,
} as const;

export const COLOR_SUCCESS = 0x00c48c;
export const COLOR_DANGER = 0xde4545;

export const DEFAULT_FLY_DURATION = 2000;

export const FOV_DEFAULTS = {
  OPACITY: 0.15,
  EDGE_OPACITY: 0.8,
} as const;

export const POPUP_HEAD_OFFSET = 0.5;

export const DEFAULT_BANNER_MESSAGE = "이상징후 감지";

export const CLIP_FLOOR_MARGIN = -1;
