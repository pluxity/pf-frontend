export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string;

export const MODEL_URL = "/assets/models/sample.glb";

export const MODEL_LNG_LAT: [number, number] = [126.8469, 37.499386];

export const INITIAL_VIEW = {
  center: MODEL_LNG_LAT,
  zoom: 17,
  pitch: 60,
  bearing: -30,
} as const;

export const MAP_STYLES = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
  night: "mapbox://styles/mapbox/navigation-night-v1",
  streets: "mapbox://styles/mapbox/streets-v12",
  outdoors: "mapbox://styles/mapbox/outdoors-v12",
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  standard: "mapbox://styles/mapbox/standard",
} as const;
