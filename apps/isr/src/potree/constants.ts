export const DEFAULT_BACKGROUND_COLOR = 0x0f172a;

export const POINT_CLOUD = {
  BUDGET: 2_000_000,
  SIZE: 1,
} as const;

export const CAMERA = {
  FOV: 60,
  NEAR: 0.1,
  FAR: 100000,
} as const;

export const CONTROLS = {
  DAMPING_FACTOR: 0.1,
  ROTATE_SPEED: 0.4,
  PAN_SPEED: 0.4,
  ZOOM_SPEED: 0.06,
  MIN_DISTANCE: 0.1,
  MAX_DISTANCE: 100000,
} as const;

export const OUTLINE = {
  DEFAULT_SCALE: 1.08,
  CCTV_COLOR: 0xff6600,
  PERSON_COLOR: 0x00ff00,
  ANIMAL_COLOR: 0xffff00,
  VEHICLE_COLOR: 0xff0000,
} as const;

export const RAYCASTER = {
  POINT_THRESHOLD: 0.5,
} as const;

export const TRACKING_MODELS = {
  person: { url: "/assets/models/person.glb", scale: 1, outlineColor: OUTLINE.PERSON_COLOR },
  animal: { url: "/assets/models/animal.glb", scale: 1, outlineColor: OUTLINE.ANIMAL_COLOR },
  vehicle: { url: "/assets/models/vehicle.glb", scale: 1, outlineColor: OUTLINE.VEHICLE_COLOR },
  unknown: { url: "/assets/models/unknown.glb", scale: 1, outlineColor: 0xffffff },
} as const;

export const DEFAULT_CCTV_CONFIG_URL = "/config/cctv-config.json";
