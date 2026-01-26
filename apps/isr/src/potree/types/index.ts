export interface GISCoordinate {
  x: number;
  y: number;
  z: number;
}

export interface GLBModelConfig {
  url: string;
  position?: GISCoordinate;
  rotation?: { x: number; y: number; z: number };
  scale?: number | { x: number; y: number; z: number };
  outlineColor?: number;
  outlineScale?: number;
}

export interface StaticModelConfig {
  id: string;
  url: string;
  position: GISCoordinate;
  rotation?: { x: number; y: number; z: number };
  scale?: number;
  outlineColor?: number;
}

export interface TrackingObject {
  id: string;
  type: "person" | "animal" | "vehicle" | "unknown";
  position: GISCoordinate;
  rotation?: number;
}

export interface TrackingModelConfig {
  type: TrackingObject["type"];
  url: string;
  scale?: number;
  outlineColor?: number;
}

export interface CCTVConfig {
  cctvList: Array<{
    id: string;
    name: string;
    position: [number, number, number];
    direction: number;
    fov: number;
    range: number;
    tilt: number;
  }>;
  model: {
    path: string;
    scale: number;
  };
}

export interface PotreeViewerProps {
  pointCloudUrl?: string;
  cctvConfigUrl?: string;
  trackingObjects?: TrackingObject[];
  showCoordinates?: boolean;
  showPointCount?: boolean;
  onError?: (error: Error) => void;
}
