import type { Entity } from "cesium";
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
// FlyTo - 특정 좌표로 카메라 이동 (duration: 0 = 즉시)
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

// Feature ID 기반
interface LookAtFeatureOptions {
  feature: string; // featureId
  distance?: number;
  heading?: number;
  pitch?: number;
  duration?: number;
}

export type LookAtOptions = LookAtCoordinateOptions | LookAtFeatureOptions;

// ============================================================================
// ZoomTo - 영역/다중 대상 맞춤 보기
// ============================================================================

// Feature 필터 타입 (ID 배열 또는 필터 함수)
export type FeatureSelector = string[] | ((entity: Entity) => boolean);

// 좌표 배열
interface ZoomToCoordinatesOptions {
  coordinates: Coordinate[];
  heading?: number;
  pitch?: number;
  duration?: number;
}

// Feature 배열 또는 필터 함수
interface ZoomToFeaturesOptions {
  features: FeatureSelector;
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

export function isZoomToBoundary(options: ZoomToOptions): options is ZoomToBoundaryOptions {
  return "boundary" in options;
}
