import type { Viewer, Entity, CustomDataSource } from "cesium";

// 좌표 타입
export interface Coordinate {
  longitude: number;
  latitude: number;
  height?: number;
}

// Viewer 설정
export interface ViewerConfig {
  ionToken?: string;
  timeline?: boolean;
  animation?: boolean;
  baseLayerPicker?: boolean;
  fullscreenButton?: boolean;
  vrButton?: boolean;
  geocoder?: boolean;
  homeButton?: boolean;
  infoBox?: boolean;
  sceneModePicker?: boolean;
  selectionIndicator?: boolean;
  navigationHelpButton?: boolean;
}

// Imagery Provider 타입
export type ImageryProviderType = "ion" | "osm" | "bing" | "arcgis";

export interface ImageryConfig {
  provider: ImageryProviderType;
  assetId?: number; // Ion 전용
  key?: string; // Bing 등 API 키가 필요한 경우
}

// Terrain 설정
export interface TerrainConfig {
  enabled: boolean;
  assetId?: number; // Ion Terrain Asset ID
}

// Marker 타입
export interface MarkerConfig {
  id: string;
  position: Coordinate;
  icon?: string;
  label?: string;
  description?: string;
  color?: string;
  scale?: number;
  onClick?: (entity: Entity) => void;
}

// Cluster 설정
export interface ClusterConfig {
  enabled: boolean;
  pixelRange?: number;
  minimumClusterSize?: number;
}

// Camera 설정
export interface CameraDestination {
  longitude: number;
  latitude: number;
  height: number;
  heading?: number;
  pitch?: number;
  roll?: number;
}

export interface FlyToOptions {
  destination: CameraDestination;
  duration?: number;
  complete?: () => void;
  cancel?: () => void;
}

// Store 상태
export interface ViewerStore {
  viewer: Viewer | null;
  markers: Map<string, Entity>;
  clusters: Map<string, CustomDataSource>;
  setViewer: (viewer: Viewer | null) => void;
  addMarker: (id: string, entity: Entity) => void;
  removeMarker: (id: string) => void;
  getMarker: (id: string) => Entity | undefined;
  addCluster: (id: string, dataSource: CustomDataSource) => void;
  removeCluster: (id: string) => void;
  getCluster: (id: string) => CustomDataSource | undefined;
  clear: () => void;
}
