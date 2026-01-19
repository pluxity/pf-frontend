import type {
  Cartesian3,
  Color,
  Entity,
  HeightReference,
  VerticalOrigin,
  Resource,
  MaterialProperty,
  Quaternion,
} from "cesium";

// ============================================================================
// Position
// ============================================================================

export interface Coordinate {
  longitude: number;
  latitude: number;
  height?: number;
}

// 동적 위치/방향 콜백 타입
export type PositionCallback = () => Cartesian3;
export type OrientationCallback = () => Quaternion;

// ============================================================================
// Feature
// ============================================================================

export type FeatureRenderType = "billboard" | "model" | "point" | "rectangle";

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
  uri: string | Resource;
  scale?: number;
  minimumPixelSize?: number;
  heightReference?: HeightReference;
  color?: Color;
  silhouetteColor?: Color;
  silhouetteSize?: number;
  runAnimations?: boolean;
}

export interface PointVisual extends BaseVisual {
  type: "point";
  pixelSize?: number;
  color?: Color;
  outlineColor?: Color;
  outlineWidth?: number;
  heightReference?: HeightReference;
}

export interface RectangleVisual extends BaseVisual {
  type: "rectangle";
  image?: string;
  material?: MaterialProperty;
  width?: number; // meters
  height?: number; // meters
  rotation?: number; // radians
  stRotation?: number; // texture rotation in radians
  fill?: boolean;
  outline?: boolean;
  outlineColor?: Color;
  outlineWidth?: number;
}

export type FeatureVisual = BillboardVisual | ModelVisual | PointVisual | RectangleVisual;

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
  orientation?: Quaternion;
}

export interface FeatureOptions {
  position: Coordinate;
  properties?: Record<string, unknown>;
  visual?: FeatureVisual;
  meta?: FeatureMeta;
  orientation?: Quaternion;
}

export interface FeaturePatch {
  position?: Coordinate;
  properties?: Record<string, unknown>;
  visual?: FeatureVisual;
  meta?: FeatureMeta;
  orientation?: Quaternion;
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

export interface FeatureStoreState {
  entities: Map<string, Entity>;
  meta: Map<string, FeatureMeta>;
  featureStates: Map<string, string>; // featureId -> state
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

  // State Management
  setFeatureState: (id: string, state: string) => void;
  getFeatureState: (id: string) => string | undefined;
  clearFeatureState: (id: string) => void;

  // Dynamic Position/Orientation (CallbackProperty 기반)
  setDynamicPosition: (id: string, callback: PositionCallback) => boolean;
  setDynamicOrientation: (id: string, callback: OrientationCallback) => boolean;
  clearDynamicPosition: (id: string) => boolean;
  clearDynamicOrientation: (id: string) => boolean;
}
