import type { GeoPosition } from "@/services/types/worker.types";

/** 3D 씬에서의 CCTV 배치 정보 (API에 없는 보충 데이터) */
export interface CCTVPlacement {
  position: GeoPosition;
  /** 카메라 방향 (도, degree) */
  heading: number;
  /** 정적 FOV 프러스텀 밑면 꼭짓점 [topLeft, topRight, bottomRight, bottomLeft] */
  frustumCorners?: [GeoPosition, GeoPosition, GeoPosition, GeoPosition];
}

/** CCTV DB id → 3D 배치 정보 매핑 (샘플용) */
export const CCTV_PLACEMENTS: Record<number, CCTVPlacement> = {
  // CCTV-JEJU2-46 → id 118
  118: {
    position: { lng: 126.846928, lat: 37.50034, altitude: 4.2 },
    heading: 150,
    frustumCorners: [
      { lng: 126.8467, lat: 37.500148, altitude: 0.1 },
      { lng: 126.84666, lat: 37.500238, altitude: 0.1 },
      { lng: 126.846861, lat: 37.500294, altitude: 0.1 },
      { lng: 126.846897, lat: 37.500206, altitude: 0.1 },
    ],
  },
  // CCTV-JEJU2-44 → id 47
  47: {
    position: { lng: 126.84666, lat: 37.499896, altitude: 15.5 },
    heading: 200,
    frustumCorners: [
      { lng: 126.846449, lat: 37.500026, altitude: 8.5 },
      { lng: 126.846553, lat: 37.500094, altitude: 8.5 },
      { lng: 126.846661, lat: 37.5, altitude: 8.5 },
      { lng: 126.846555, lat: 37.499924, altitude: 8.5 },
    ],
  },
  // CCTV-JEJU2-35 → id 38
  38: {
    position: { lng: 126.846753, lat: 37.500111, altitude: 82.4 },
    heading: 200,
    frustumCorners: [
      { lng: 126.846627, lat: 37.500043, altitude: 8.5 },
      { lng: 126.846695, lat: 37.500134, altitude: 8.5 },
      { lng: 126.846765, lat: 37.500115, altitude: 8.5 },
      { lng: 126.846712, lat: 37.50002, altitude: 12.19 },
    ],
  },
  // CCTV-JEJU2-36 → id 39
  39: {
    position: { lng: 126.84643, lat: 37.499803, altitude: 44.2 },
    heading: 200,
    frustumCorners: [
      { lng: 126.846383, lat: 37.49993, altitude: 8.5 },
      { lng: 126.84651, lat: 37.499967, altitude: 8.5 },
      { lng: 126.846556, lat: 37.499897, altitude: 8.5 },
      { lng: 126.846421, lat: 37.499854, altitude: 8.5 },
    ],
  },
};

/** 시나리오3에서 사용하는 CCTV DB id (구: CCTV-JEJU2-46) */
export const SCENARIO3_CCTV_ID = 118;

/** 샘플용 고정 siteId */
export const SAMPLE_SITE_ID = 15;
