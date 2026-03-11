import type { BuildingId } from "@/babylon/types";

export interface CCTVCameraConfig {
  id: string;
  label: string;
  buildingId: BuildingId;
  zone?: string;
  streamName: string;
  position3d?: { x: number; z: number };
}

// WHEP media proxy base path (proxied via Vite dev server)
const MEDIA_BASE = "/media/webrtc";

export function getWHEPUrl(streamName: string): string {
  return `${MEDIA_BASE}/${streamName}/whep`;
}

/**
 * Stream names: CCTV-GIMPO-01 ~ 04
 * Media server: 14.51.233.128:8813
 */
export const CCTV_CAMERAS: CCTVCameraConfig[] = [
  // 본관 (Main Factory)
  {
    id: "CAM-MAIN-01",
    label: "본관 가공구역 카메라",
    buildingId: "main-factory",
    zone: "가공 구역",
    streamName: "CCTV-GIMPO-01",
    position3d: { x: -55, z: -30 },
  },
  {
    id: "CAM-MAIN-02",
    label: "본관 조립구역 카메라",
    buildingId: "main-factory",
    zone: "조립 구역",
    streamName: "CCTV-GIMPO-02",
    position3d: { x: -28, z: -30 },
  },

  // 물류동 (Warehouse)
  {
    id: "CAM-WH-01",
    label: "물류동 적치구역 카메라",
    buildingId: "warehouse",
    zone: "적치 구역",
    streamName: "CCTV-GIMPO-03",
    position3d: { x: 50, z: -32 },
  },

  // 유틸리티동 (Utility)
  {
    id: "CAM-UTIL-01",
    label: "유틸리티동 전기실 카메라",
    buildingId: "utility",
    zone: "전기실",
    streamName: "CCTV-GIMPO-04",
    position3d: { x: -46, z: 45 },
  },
];

/** Camera lookup by ID */
export function getCameraById(id: string): CCTVCameraConfig | undefined {
  return CCTV_CAMERAS.find((cam) => cam.id === id);
}

/** Get cameras for a specific building */
export function getCamerasByBuilding(buildingId: BuildingId): CCTVCameraConfig[] {
  return CCTV_CAMERAS.filter((cam) => cam.buildingId === buildingId);
}
