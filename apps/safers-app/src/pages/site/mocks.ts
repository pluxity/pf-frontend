import type { WorkerEntry } from "./components";
import type { SiteEmergencyPayload } from "@/services";
import type { FeaturePosition, WorkerVitals } from "./components/mapbox-viewer/types";

// ─── Worker positions + vitals (ThreeOverlay) ───

export interface MockWorkerPosition {
  id: string;
  position: FeaturePosition;
  vitals: WorkerVitals;
}

export const MOCK_WORKER_POSITIONS: MockWorkerPosition[] = [
  {
    id: "worker-1",
    position: { lng: 126.846865, lat: 37.500245, altitude: 3.5 },
    vitals: { temperature: 36.5, heartRate: 78 },
  },
  {
    id: "worker-2",
    position: { lng: 126.84648, lat: 37.499865, altitude: 11.9 },
    vitals: { temperature: 36.8, heartRate: 92 },
  },
  {
    id: "worker-3",
    position: { lng: 126.846643, lat: 37.499556, altitude: 11.9 },
    vitals: { temperature: 36.7, heartRate: 82 },
  },
  {
    id: "worker-4",
    position: { lng: 126.847061, lat: 37.499351, altitude: 11.9 },
    vitals: { temperature: 36.4, heartRate: 85 },
  },
  {
    id: "worker-5",
    position: { lng: 126.847065, lat: 37.499254, altitude: 9.7 },
    vitals: { temperature: 36.6, heartRate: 72 },
  },
  {
    id: "worker-6",
    position: { lng: 126.846965, lat: 37.49946, altitude: 37.7 },
    vitals: { temperature: 36.5, heartRate: 76 },
  },
];

/** Server fetching simulation — will be replaced by wearable band -> server -> API */
export async function fetchWorkerPositions(): Promise<MockWorkerPosition[]> {
  await new Promise((r) => setTimeout(r, 500));
  return MOCK_WORKER_POSITIONS;
}

// ─── Worker panel initial data ───

export const INITIAL_WORKERS: WorkerEntry[] = [
  { id: "worker-1", name: "김철수", status: "normal", info: "36.5°C / 78bpm" },
  { id: "worker-2", name: "이영희", status: "normal", info: "36.8°C / 92bpm" },
  { id: "worker-3", name: "박민수", status: "normal", info: "36.7°C / 82bpm" },
  { id: "worker-4", name: "정수진", status: "normal", info: "36.4°C / 85bpm" },
  { id: "worker-5", name: "최동훈", status: "normal", info: "36.6°C / 72bpm" },
  { id: "worker-6", name: "한지원", status: "normal", info: "36.5°C / 76bpm" },
];

// ─── Scenario 1, 2 emergency payloads ───

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

// ─── Scenario 3 config ───

export const SCENARIO3 = {
  workerId: "worker-1",
  cctvId: "CCTV-JEJU2-44",
  from: { lng: 126.846865, lat: 37.500245, altitude: 3.5 },
  to: { lng: 126.846679, lat: 37.500262, altitude: 5.9 },
  moveDurationMs: 4000,
  camera: {
    center: [126.84685, 37.5] as [number, number],
    zoom: 19.2,
    pitch: 55,
    bearing: 150,
  },
  emergency: {
    workerId: "worker-1",
    position: { lng: 126.846679, lat: 37.500262, altitude: 5.9 },
    vitals: { temperature: 36.5, heartRate: 78 },
  } satisfies SiteEmergencyPayload,
};

// ─── Default worker vitals (for reset) ───

export const DEFAULT_WORKER_VITALS: Record<string, WorkerVitals> = {
  "worker-1": { temperature: 36.5, heartRate: 78 },
  "worker-2": { temperature: 36.8, heartRate: 92 },
  "worker-3": { temperature: 36.7, heartRate: 82 },
  "worker-4": { temperature: 36.4, heartRate: 85 },
  "worker-5": { temperature: 36.6, heartRate: 72 },
  "worker-6": { temperature: 36.5, heartRate: 76 },
};

// ─── Event counter ───

let eventCounter = 0;
export function nextEventId(): string {
  return `evt-${++eventCounter}`;
}
