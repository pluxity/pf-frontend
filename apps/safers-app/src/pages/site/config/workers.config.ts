import type { WorkerEntry } from "../components";
import type { GeoPosition, WorkerVitals } from "@/services/types/worker.types";

export { fetchWorkerPositions } from "@/services/mocks/workers.mock";

export const DEFAULT_WORKER_VITALS: Record<string, WorkerVitals> = {
  "worker-1": { temperature: 36.5, heartRate: 78 },
  "worker-2": { temperature: 36.8, heartRate: 92 },
  "worker-3": { temperature: 36.7, heartRate: 82 },
  "worker-4": { temperature: 36.4, heartRate: 85 },
  "worker-5": { temperature: 36.6, heartRate: 72 },
  "worker-6": { temperature: 36.5, heartRate: 76 },
};

export const INITIAL_WORKERS: WorkerEntry[] = [
  { id: "worker-1", name: "김철수", status: "normal", info: "36.5°C / 78bpm" },
  { id: "worker-2", name: "이영희", status: "normal", info: "36.8°C / 92bpm" },
  { id: "worker-3", name: "박민수", status: "normal", info: "36.7°C / 82bpm" },
  { id: "worker-4", name: "정수진", status: "normal", info: "36.4°C / 85bpm" },
  { id: "worker-5", name: "최동훈", status: "normal", info: "36.6°C / 72bpm" },
  { id: "worker-6", name: "한지원", status: "normal", info: "36.5°C / 76bpm" },
];

export const WORKER1_PATROL_PATH: GeoPosition[] = [
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

export const WORKER4_PATROL_PATH: GeoPosition[] = [
  { lng: 126.847074, lat: 37.499254, altitude: 6.3 },
  { lng: 126.847049, lat: 37.499198, altitude: 4.1 },
  { lng: 126.847081, lat: 37.499155, altitude: 4.1 },
  { lng: 126.847152, lat: 37.499175, altitude: 1.9 },
  { lng: 126.847218, lat: 37.499195, altitude: -0.3 },
  { lng: 126.847288, lat: 37.499211, altitude: -0.3 },
  { lng: 126.847296, lat: 37.499176, altitude: -0.3 },
  { lng: 126.84718, lat: 37.499138, altitude: -0.28 },
  { lng: 126.846874, lat: 37.499069, altitude: 3 },
  { lng: 126.846853, lat: 37.499162, altitude: 3.4 },
  { lng: 126.846907, lat: 37.499138, altitude: 3.62 },
  { lng: 126.847049, lat: 37.499198, altitude: 4.1 },
  { lng: 126.847074, lat: 37.499254, altitude: 6.3 },
];

export const WORKER1_PATROL_DURATION = 60_000;
export const WORKER4_PATROL_DURATION = 60_000;

/** 덤프트럭 순찰 경로 — 건물 외곽 도로 순환 */
export const DUMP_PATROL_PATH: GeoPosition[] = [
  { lng: 126.84661, lat: 37.50133, altitude: 0 },
  { lng: 126.846821, lat: 37.500907, altitude: 0 },
  { lng: 126.847, lat: 37.500524, altitude: 0 },
  { lng: 126.847004, lat: 37.5004, altitude: 0 },
  { lng: 126.846802, lat: 37.500354, altitude: 0.28 },
  { lng: 126.846729, lat: 37.500333, altitude: 1.72 },
  { lng: 126.846617, lat: 37.500302, altitude: 3.66 },
  { lng: 126.846544, lat: 37.50028, altitude: 4.95 },
  { lng: 126.846444, lat: 37.500251, altitude: 6.63 },
  { lng: 126.846339, lat: 37.500223, altitude: 7.29 },
  { lng: 126.846279, lat: 37.500205, altitude: 7.29 },
  { lng: 126.846249, lat: 37.500141, altitude: 7.29 },
  { lng: 126.84628, lat: 37.500072, altitude: 7.29 },
  { lng: 126.84632, lat: 37.499986, altitude: 7.29 },
  { lng: 126.846376, lat: 37.499878, altitude: 7.29 },
  { lng: 126.846505, lat: 37.499583, altitude: 7.29 },
  { lng: 126.846552, lat: 37.499485, altitude: 6.99 },
  { lng: 126.846594, lat: 37.4994, altitude: 5.7 },
  { lng: 126.846651, lat: 37.499282, altitude: 3.9 },
  { lng: 126.846693, lat: 37.499196, altitude: 2.6 },
  { lng: 126.846735, lat: 37.499114, altitude: 2 },
  { lng: 126.846784, lat: 37.499013, altitude: 2 },
  { lng: 126.846837, lat: 37.498894, altitude: 2 },
  { lng: 126.84686, lat: 37.49884, altitude: 2 },
  { lng: 126.846903, lat: 37.498743, altitude: 1.61 },
  { lng: 126.846957, lat: 37.498623, altitude: 0.51 },
  { lng: 126.847014, lat: 37.49851, altitude: -0.3 },
  { lng: 126.847208, lat: 37.498545, altitude: -0.3 },
  { lng: 126.847327, lat: 37.498568, altitude: -0.3 },
  { lng: 126.847344, lat: 37.498528, altitude: -0.3 },
  { lng: 126.847334, lat: 37.49849, altitude: -0.3 },
];
export const DUMP_PATROL_DURATION = 90_000;
