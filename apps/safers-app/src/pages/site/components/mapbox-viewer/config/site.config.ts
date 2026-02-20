import type { ModelTransform } from "../types";

export const MODEL_URL = "/assets/models/safers.glb";
export const MODEL_LNG_LAT: [number, number] = [126.8469, 37.499386];

export const MODEL_TRANSFORM: ModelTransform = {
  lng: 126.84714,
  lat: 37.498996,
  altitude: 0,
  rotationX: 90,
  rotationY: 111,
  rotationZ: 0,
  scale: 1.0,
};

export const INITIAL_VIEW = {
  center: MODEL_LNG_LAT,
  zoom: 18,
  pitch: 60,
  bearing: 120,
} as const;

export const EMERGENCY_CAMERA = {
  BASE_ZOOM: 20.5,
  BASE_ALT: 11.9,
  BEARING: 120,
  PITCH: 45.5,
} as const;
