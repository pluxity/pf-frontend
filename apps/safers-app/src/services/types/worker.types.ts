/** GPS 좌표 (서비스 레이어 공용) */
export interface GeoPosition {
  lng: number;
  lat: number;
  altitude: number;
}

export interface WorkerVitals {
  temperature: number;
  heartRate: number;
}

export type LocationType = "indoor" | "outdoor";

export interface WorkerLocation {
  locationType: LocationType;
  building?: string;
  floor: string;
  floorNumber: number;
}
