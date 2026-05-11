import type { SiteEmergencyPayload } from "@/services";
import type { GeoPosition } from "@/services/types/worker.types";

export const SCENARIO_EMERGENCIES: Record<1 | 2, SiteEmergencyPayload> = {
  1: {
    workerId: "worker-3",
    position: { lng: 126.846774, lat: 37.49943, altitude: 11.9 },
    vitals: { temperature: 38.5, heartRate: 145 },
  },
  2: {
    workerId: "worker-6",
    position: { lng: 126.846965, lat: 37.49946, altitude: 37.7 },
    vitals: { temperature: 39.1, heartRate: 160 },
  },
};

export const SCENARIO_CAMERAS: Record<
  1 | 2,
  {
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
  }
> = {
  1: {
    center: [126.846947, 37.499369],
    zoom: 20.79,
    pitch: 52.74,
    bearing: 105.74,
  },
  2: {
    center: [126.847302, 37.499369],
    zoom: 19.9,
    pitch: 41,
    bearing: 108.09,
  },
};

export const SCENARIO3 = {
  workerId: "worker-1",
  cctvId: "cctv-118",
  dangerZoneEntry: { lng: 126.846852, lat: 37.500211, altitude: 0.15 } satisfies GeoPosition,
  moveDurationMs: 6000,
  camera: {
    center: [126.846899, 37.50024] as [number, number],
    zoom: 20.77,
    pitch: 38.49,
    bearing: 133.42,
  },
  emergency: {
    workerId: "worker-1",
    position: { lng: 126.846852, lat: 37.500211, altitude: 0.15 },
    vitals: { temperature: 36.5, heartRate: 78 },
  } satisfies SiteEmergencyPayload,

  /** dz-1 도착 후 dz-2 이동 시작까지 감시 대기 시간 (ms) */
  dz2WaitMs: 10000,
  /** dz-2까지 이동 소요 시간 (ms) */
  dz2MoveDurationMs: 15000,
  /** dz-1 → dz-2 이동 경로 */
  dz2Path: [
    { lng: 126.846875, lat: 37.50022, altitude: 0.77 },
    { lng: 126.846897, lat: 37.500233, altitude: 0.99 },
    { lng: 126.846901, lat: 37.500224, altitude: 0.64 },
    { lng: 126.846908, lat: 37.500195, altitude: -0.04 },
    { lng: 126.846885, lat: 37.500187, altitude: 1.1 },
    { lng: 126.84687, lat: 37.500184, altitude: 1.86 },
    { lng: 126.846851, lat: 37.500181, altitude: 2.63 },
    { lng: 126.846832, lat: 37.500175, altitude: 3.35 },
    { lng: 126.846816, lat: 37.50017, altitude: 4.39 },
    { lng: 126.846794, lat: 37.500163, altitude: 5.49 },
    { lng: 126.846775, lat: 37.500157, altitude: 6.03 },
    { lng: 126.846763, lat: 37.500148, altitude: 6.88 },
    { lng: 126.846741, lat: 37.500132, altitude: 8.35 },
    { lng: 126.846738, lat: 37.500122, altitude: 8.75 },
    { lng: 126.846733, lat: 37.500123, altitude: 9.0 },
    { lng: 126.846653, lat: 37.500049, altitude: 9.0 },
    { lng: 126.846634, lat: 37.500044, altitude: 9.0 },
    { lng: 126.846601, lat: 37.500029, altitude: 9.0 },
  ] as const satisfies readonly GeoPosition[],
  /** dz-2 담당 CCTV (4번 게이트) */
  dz2CctvId: "cctv-47",
  /** dz-2 이동 시 카메라 위치 */
  dz2Camera: {
    center: [126.84666, 37.500021] as [number, number],
    zoom: 20.24,
    pitch: 44,
    bearing: 136,
  },
};

let eventCounter = -1;
export function nextEventId(): number {
  return eventCounter--;
}
