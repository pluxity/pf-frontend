import type { GeoPosition } from "./worker.types";

export interface CCTVPath {
  name: string;
  confName: string;
  source: {
    type: string;
    id: string;
  };
  ready: boolean;
  readyTime: string | null;
  tracks: string[];
  ptz: boolean;
  ptzType: string;
}

export interface CCTVPathsResponse {
  itemCount: number;
  pageCount: number;
  items: CCTVPath[];
}

export interface CCTVData {
  id: string;
  name: string;
  position: GeoPosition;
  /** 카메라 방향 (도, degree) */
  heading: number;
  /** 수평 시야각 (도, degree) */
  fovDeg: number;
  /** 시야 거리 (미터) */
  fovRange: number;
  /** 카메라 틸트 (도, 음수 = 아래쪽) */
  pitch: number;
  /** WHEP 스트림 이름 (e.g. "CCTV-JEJU2-44") */
  streamName: string;
  /** 정적 FOV 프러스텀 밑면 꼭짓점 [topLeft, topRight, bottomRight, bottomLeft] */
  frustumCorners?: [GeoPosition, GeoPosition, GeoPosition, GeoPosition];
}

export interface CCTVListResponse {
  data: CCTVData[];
}
