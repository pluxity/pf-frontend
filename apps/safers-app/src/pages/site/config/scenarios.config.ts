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
};

let eventCounter = 0;
export function nextEventId(): string {
  return `evt-${++eventCounter}`;
}
