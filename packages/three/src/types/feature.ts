import type { Object3D } from "three";

export type AssetType = "cctv" | "fan" | "airconditioner" | "sensor" | "light" | string;

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  modelUrl: string;
  thumbnail?: string;
  object?: Object3D;
  loadedAt?: number;
}

export interface Feature {
  id: string;
  assetId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number | [number, number, number];
  metadata?: Record<string, unknown>;
  visible?: boolean;
}

export interface AssetState {
  assets: Map<string, Asset>;
}

export interface AssetActions {
  addAsset: (asset: Asset) => void;
  addAssets: (assets: Asset[]) => Promise<void>;
  getAsset: (id: string) => Asset | null;
  removeAsset: (id: string) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  getAllAssets: () => Asset[];
  getAssetsByType: (type: AssetType) => Asset[];
  clearAll: () => void;
}

export interface FeatureState {
  features: Map<string, Feature>;
  featuresByAsset: Map<string, Set<string>>;
}

export interface FeatureActions {
  addFeature: (feature: Feature) => void;
  addFeatures: (features: Feature[]) => void;
  getFeature: (id: string) => Feature | null;
  removeFeature: (id: string) => void;
  updateFeature: (id: string, updates: Partial<Feature>) => void;
  getFeaturesByAsset: (assetId: string) => Feature[];
  getAllFeatures: () => Feature[];
  clearAll: () => void;
}

export type AssetStore = AssetState & AssetActions;
export type FeatureStore = FeatureState & FeatureActions;
