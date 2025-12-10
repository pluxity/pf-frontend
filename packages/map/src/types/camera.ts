import type { Coordinate } from "./feature.ts";

// ============================================================================
// Camera Position (현재 카메라 상태)
// ============================================================================

export interface CameraPosition {
  longitude: number;
  latitude: number;
  height: number;
  heading: number;
  pitch: number;
}

// ============================================================================
// Feature Reference (Feature ID로 참조)
// ============================================================================

export interface FeatureRef {
  groupId: string;
  featureId: string;
}

// ============================================================================
// FlyTo - 특정 좌표로 카메라 이동
// ============================================================================

export interface FlyToOptions {
  longitude: number;
  latitude: number;
  height?: number;
  heading?: number;
  pitch?: number;
  duration?: number;
}

// ============================================================================
// SetView - 즉시 카메라 설정
// ============================================================================

export interface SetViewOptions {
  longitude: number;
  latitude: number;
  height?: number;
  heading?: number;
  pitch?: number;
}

// ============================================================================
// LookAt - 단일 대상 바라보기
// ============================================================================

// 좌표 기반
interface LookAtCoordinateOptions {
  longitude: number;
  latitude: number;
  height?: number;
  distance?: number;
  heading?: number;
  pitch?: number;
  duration?: number;
}

// Feature 기반
interface LookAtFeatureOptions {
  feature: FeatureRef;
  distance?: number;
  heading?: number;
  pitch?: number;
  duration?: number;
}

export type LookAtOptions = LookAtCoordinateOptions | LookAtFeatureOptions;

// ============================================================================
// ZoomTo - 영역/다중 대상 맞춤 보기
// ============================================================================

// 좌표 배열
interface ZoomToCoordinatesOptions {
  coordinates: Coordinate[];
  heading?: number;
  pitch?: number;
  duration?: number;
}

// Feature 배열
interface ZoomToFeaturesOptions {
  features: FeatureRef[];
  heading?: number;
  pitch?: number;
  duration?: number;
}

// 그룹 전체
interface ZoomToGroupOptions {
  groupId: string;
  heading?: number;
  pitch?: number;
  duration?: number;
}

// WKT Boundary
interface ZoomToBoundaryOptions {
  boundary: string; // WKT Polygon
  heading?: number;
  pitch?: number;
  duration?: number;
}

export type ZoomToOptions =
  | ZoomToCoordinatesOptions
  | ZoomToFeaturesOptions
  | ZoomToGroupOptions
  | ZoomToBoundaryOptions;

// ============================================================================
// Type Guards
// ============================================================================

export function isLookAtFeature(options: LookAtOptions): options is LookAtFeatureOptions {
  return "feature" in options;
}

export function isZoomToCoordinates(options: ZoomToOptions): options is ZoomToCoordinatesOptions {
  return "coordinates" in options;
}

export function isZoomToFeatures(options: ZoomToOptions): options is ZoomToFeaturesOptions {
  return "features" in options;
}

export function isZoomToGroup(options: ZoomToOptions): options is ZoomToGroupOptions {
  return "groupId" in options;
}

export function isZoomToBoundary(options: ZoomToOptions): options is ZoomToBoundaryOptions {
  return "boundary" in options;
}
