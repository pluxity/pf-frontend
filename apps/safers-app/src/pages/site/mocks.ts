import type { WorkerEntry } from "./components";
import type { SiteEmergencyPayload } from "@/services";
import type { FeaturePosition } from "./components/mapbox-viewer/types";

export { fetchWorkerPositions, DEFAULT_WORKER_VITALS } from "@/services/mocks/workers.mock";

export const INITIAL_WORKERS: WorkerEntry[] = [
  {
    id: "worker-1",
    name: "김철수",
    status: "normal",
    info: "36.5°C / 78bpm",
    locationType: "outdoor",
    floor: "1F",
  },
  {
    id: "worker-2",
    name: "이영희",
    status: "normal",
    info: "36.8°C / 92bpm",
    locationType: "indoor",
    floor: "3F",
  },
  {
    id: "worker-3",
    name: "박민수",
    status: "normal",
    info: "36.7°C / 82bpm",
    locationType: "indoor",
    floor: "3F",
  },
  {
    id: "worker-4",
    name: "정수진",
    status: "normal",
    info: "36.4°C / 85bpm",
    locationType: "indoor",
    floor: "3F",
  },
  {
    id: "worker-5",
    name: "최동훈",
    status: "normal",
    info: "36.6°C / 72bpm",
    locationType: "indoor",
    floor: "2F",
  },
  {
    id: "worker-6",
    name: "한지원",
    status: "normal",
    info: "36.5°C / 76bpm",
    locationType: "indoor",
    floor: "12F",
  },
];

export const SCENARIO_EMERGENCIES: Record<1 | 2, SiteEmergencyPayload> = {
  1: {
    workerId: "worker-3",
    position: { lng: 126.846643, lat: 37.499556, altitude: 11.9 },
    vitals: { temperature: 38.5, heartRate: 145 },
  },
  2: {
    workerId: "worker-6",
    position: { lng: 126.846965, lat: 37.49946, altitude: 37.7 },
    vitals: { temperature: 39.1, heartRate: 160 },
  },
};

export const WORKER1_PATROL_PATH: FeaturePosition[] = [
  { lng: 126.846879, lat: 37.50037, altitude: 0.1 },
  { lng: 126.846843, lat: 37.50036, altitude: 0.1 },
  { lng: 126.84686, lat: 37.500313, altitude: 0.1 },
  { lng: 126.846713, lat: 37.50027, altitude: 0.088 },
  { lng: 126.846736, lat: 37.500232, altitude: 0 },
  { lng: 126.84688, lat: 37.500279, altitude: 0.058 },
  { lng: 126.846946, lat: 37.500142, altitude: 0.098 },
  { lng: 126.846978, lat: 37.500152, altitude: 0.061 },
  { lng: 126.846894, lat: 37.500336, altitude: 0.1 },
  { lng: 126.846879, lat: 37.50037, altitude: 0.1 },
];

export const WORKER1_PATROL_DURATION = 60_000;

export const SCENARIO3 = {
  workerId: "worker-1",
  cctvId: "CCTV-JEJU2-46",
  dangerZoneEntry: { lng: 126.846852, lat: 37.500211, altitude: 0.15 } satisfies FeaturePosition,
  moveDurationMs: 3000,
  camera: {
    center: [126.84685, 37.50025] as [number, number],
    zoom: 20,
    pitch: 50,
    bearing: 120,
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
