import type { ModelTransform } from "../types";

export const MODEL_URL = `${import.meta.env.VITE_MINIO_URL}/models/buildings/safers.glb`;
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
  ZOOM: 21.5,
  BEARING: 120,
  PITCH: 35,
} as const;
