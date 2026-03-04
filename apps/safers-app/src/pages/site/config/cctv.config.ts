import type { GeoPosition } from "@/services/types/worker.types";

export interface MockCCTV {
  id: string;
  name: string;
  position: GeoPosition;
  /** 카메라 방향 (도, degree) */
  heading: number;
  /** WHEP 스트림 이름 */
  streamName: string;
  /** 정적 FOV 프러스텀 밑면 꼭짓점 [topLeft, topRight, bottomRight, bottomLeft] */
  frustumCorners?: [GeoPosition, GeoPosition, GeoPosition, GeoPosition];
}

/** Site 페이지 프로토타입용 mock CCTV 목록 (370a8d7 기준 복원) */
export const MOCK_CCTVS: MockCCTV[] = [
  {
    id: "CCTV-JEJU2-46",
    name: "CCTV-JEJU2-46",
    position: { lng: 126.846928, lat: 37.50034, altitude: 4.2 },
    heading: 150,
    streamName: "CCTV-JEJU2-46",
    frustumCorners: [
      { lng: 126.8467, lat: 37.500148, altitude: 0.1 },
      { lng: 126.84666, lat: 37.500238, altitude: 0.1 },
      { lng: 126.846861, lat: 37.500294, altitude: 0.1 },
      { lng: 126.846897, lat: 37.500206, altitude: 0.1 },
    ],
  },
  {
    id: "CCTV-JEJU2-44",
    name: "CCTV-JEJU2-44",
    position: { lng: 126.84666, lat: 37.499896, altitude: 15.5 },
    heading: 200,
    streamName: "CCTV-JEJU2-44",
    frustumCorners: [
      { lng: 126.846449, lat: 37.500026, altitude: 8.5 },
      { lng: 126.846553, lat: 37.500094, altitude: 8.5 },
      { lng: 126.846661, lat: 37.5, altitude: 8.5 },
      { lng: 126.846555, lat: 37.499924, altitude: 8.5 },
    ],
  },
  {
    id: "CCTV-JEJU2-35",
    name: "CCTV-JEJU2-35",
    position: { lng: 126.846753, lat: 37.500111, altitude: 82.4 },
    heading: 200,
    streamName: "CCTV-JEJU2-35",
    frustumCorners: [
      { lng: 126.846627, lat: 37.500043, altitude: 8.5 },
      { lng: 126.846695, lat: 37.500134, altitude: 8.5 },
      { lng: 126.846765, lat: 37.500115, altitude: 8.5 },
      { lng: 126.846712, lat: 37.50002, altitude: 12.19 },
    ],
  },
  {
    id: "CCTV-JEJU2-36",
    name: "CCTV-JEJU2-36",
    position: { lng: 126.84643, lat: 37.499803, altitude: 44.2 },
    heading: 200,
    streamName: "CCTV-JEJU2-36",
    frustumCorners: [
      { lng: 126.846383, lat: 37.49993, altitude: 8.5 },
      { lng: 126.84651, lat: 37.499967, altitude: 8.5 },
      { lng: 126.846556, lat: 37.499897, altitude: 8.5 },
      { lng: 126.846421, lat: 37.499854, altitude: 8.5 },
    ],
  },
];
