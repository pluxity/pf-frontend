import type { Color, Entity, HeightReference, VerticalOrigin } from "cesium";

// ============================================================================
// Position
// ============================================================================

export interface Coordinate {
  longitude: number;
  latitude: number;
  height?: number;
}

// ============================================================================
// Feature
// ============================================================================

export type FeatureRenderType = "billboard" | "model" | "point";

export interface DisplayConditionRange {
  near?: number;
  far?: number;
}

interface BaseVisual {
  show?: boolean;
  distanceDisplayCondition?: DisplayConditionRange;
  disableDepthTestDistance?: number;
}

export interface BillboardVisual extends BaseVisual {
  type: "billboard";
  image?: string;
  color?: Color;
  width?: number;
  height?: number;
  scale?: number;
  heightReference?: HeightReference;
  verticalOrigin?: VerticalOrigin;
}

export interface ModelVisual extends BaseVisual {
  type: "model";
  uri: string;
  scale?: number;
  minimumPixelSize?: number;
  color?: Color;
  silhouetteColor?: Color;
  silhouetteSize?: number;
}

export interface PointVisual extends BaseVisual {
  type: "point";
  pixelSize?: number;
  color?: Color;
  outlineColor?: Color;
  outlineWidth?: number;
  heightReference?: HeightReference;
}

export type FeatureVisual = BillboardVisual | ModelVisual | PointVisual;

export interface FeatureMeta {
  layerName?: string;
  tags?: string[];
  category?: string;
  visible?: boolean;
}

export interface Feature {
  id: string;
  position: Coordinate;
  properties?: Record<string, unknown>;
  visual?: FeatureVisual;
  meta?: FeatureMeta;
}

// 기존 호환용 (단일 추가 시)
export interface FeatureOptions {
  position: Coordinate;
  properties?: Record<string, unknown>;
  visual?: FeatureVisual;
  meta?: FeatureMeta;
}

export interface FeaturePatch {
  position?: Coordinate;
  properties?: Record<string, unknown>;
  visual?: FeatureVisual;
  meta?: FeatureMeta;
}

// ============================================================================
// Filter Types
// ============================================================================

// Property 필터 타입 (properties 객체만 접근)
export type PropertyFilter =
  | Record<string, unknown>
  | ((properties: Record<string, unknown>) => boolean);

// Feature 필터 타입 (Entity 전체 접근)
export type FeatureFilter = (entity: Entity, meta?: FeatureMeta) => boolean;

// Feature 선택자 (ID 배열 또는 필터 함수)
export type FeatureSelector = string[] | FeatureFilter;

// ============================================================================
// Feature Store Types
// ============================================================================

export interface FeatureState {
  entities: Map<string, Entity>;
  meta: Map<string, FeatureMeta>;
}

export interface FeatureActions {
  // 단일 Feature
  addFeature: (id: string, options: FeatureOptions) => Entity | null;
  getFeature: (id: string) => Entity | null;
  removeFeature: (id: string) => boolean;
  hasFeature: (id: string) => boolean;
  updatePosition: (id: string, position: Coordinate) => boolean;
  updateFeature: (id: string, patch: FeaturePatch) => boolean;

  // 복수 Features
  addFeatures: (features: Feature[]) => Entity[];
  getFeatures: (selector: FeatureSelector) => Entity[];
  removeFeatures: (selector: FeatureSelector) => number;
  setVisibility: (selector: FeatureSelector, visible: boolean) => number;

  // Query
  findByProperty: (filter: PropertyFilter) => Entity[];

  // Bulk
  getFeatureCount: () => number;
  getAllFeatures: () => Entity[];
  clearAll: () => void;
}
