import type { WorkerVitals, WorkerLocation } from "@/services/types/worker.types";

export type { WorkerVitals, WorkerLocation, LocationType } from "@/services/types/worker.types";
export type { DangerZone } from "@/services/types/danger-zone.types";

export interface SelectedFeatureData {
  id: string;
  lng: number;
  lat: number;
  altitude: number;
  vitals: WorkerVitals | null;
  streamUrl: string | null;
  location: WorkerLocation | null;
}
