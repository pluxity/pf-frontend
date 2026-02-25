import type { GeoPosition, WorkerVitals, WorkerLocation } from "../types/worker.types";

export interface MockWorkerPosition {
  id: string;
  position: GeoPosition;
  vitals: WorkerVitals;
  location: WorkerLocation;
}

export const MOCK_WORKER_POSITIONS: MockWorkerPosition[] = [
  {
    id: "worker-1",
    position: { lng: 126.846865, lat: 37.500245, altitude: 0 },
    vitals: { temperature: 36.5, heartRate: 78 },
    location: { locationType: "outdoor", floor: "1F", floorNumber: 1 },
  },
  {
    id: "worker-2",
    position: { lng: 126.84648, lat: 37.499865, altitude: 8.5 },
    vitals: { temperature: 36.8, heartRate: 92 },
    location: { locationType: "outdoor", floor: "3F", floorNumber: 3 },
  },
  {
    id: "worker-3",
    position: { lng: 126.846774, lat: 37.49943, altitude: 8.5 },
    vitals: { temperature: 36.7, heartRate: 82 },
    location: { locationType: "outdoor", floor: "3F", floorNumber: 3 },
  },
  {
    id: "worker-4",
    position: { lng: 126.847061, lat: 37.499351, altitude: 8.5 },
    vitals: { temperature: 36.4, heartRate: 85 },
    location: { locationType: "outdoor", floor: "3F", floorNumber: 3 },
  },
  {
    id: "worker-5",
    position: { lng: 126.847086, lat: 37.49951, altitude: 8.5 },
    vitals: { temperature: 36.6, heartRate: 72 },
    location: { locationType: "outdoor", floor: "3F", floorNumber: 3 },
  },
  {
    id: "worker-6",
    position: { lng: 126.846965, lat: 37.49946, altitude: 34.5 },
    vitals: { temperature: 36.5, heartRate: 76 },
    location: { locationType: "indoor", floor: "12F", floorNumber: 12 },
  },
];

export async function fetchWorkerPositions(): Promise<MockWorkerPosition[]> {
  await new Promise((r) => setTimeout(r, 3000));
  return MOCK_WORKER_POSITIONS;
}

export const DEFAULT_WORKER_VITALS: Record<string, WorkerVitals> = {
  "worker-1": { temperature: 36.5, heartRate: 78 },
  "worker-2": { temperature: 36.8, heartRate: 92 },
  "worker-3": { temperature: 36.7, heartRate: 82 },
  "worker-4": { temperature: 36.4, heartRate: 85 },
  "worker-5": { temperature: 36.6, heartRate: 72 },
  "worker-6": { temperature: 36.5, heartRate: 76 },
};

export const DEFAULT_WORKER_LOCATIONS: Record<string, WorkerLocation> = {
  "worker-1": { locationType: "outdoor", floor: "1F", floorNumber: 1 },
  "worker-2": { locationType: "outdoor", floor: "3F", floorNumber: 3 },
  "worker-3": { locationType: "outdoor", floor: "3F", floorNumber: 3 },
  "worker-4": { locationType: "outdoor", floor: "3F", floorNumber: 3 },
  "worker-5": { locationType: "outdoor", floor: "2F", floorNumber: 2 },
  "worker-6": { locationType: "indoor", floor: "12F", floorNumber: 12 },
};
