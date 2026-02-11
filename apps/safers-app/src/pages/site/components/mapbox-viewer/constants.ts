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
