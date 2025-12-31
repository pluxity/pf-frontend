import type { Entity } from "cesium";
import type { Coordinate } from "./feature";

// ============================================================================
// Camera Position
// ============================================================================

export interface CameraPosition {
  longitude: number;
  latitude: number;
  height: number;
  heading: number;
  pitch: number;
}

// ============================================================================
// FlyTo
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
// LookAt
// ============================================================================

interface LookAtCoordinateOptions {
  longitude: number;
  latitude: number;
  height?: number;
  distance?: number;
  heading?: number;
  pitch?: number;
  duration?: number;
}

interface LookAtFeatureOptions {
  feature: string; // featureId
  distance?: number;
  heading?: number;
  pitch?: number;
  duration?: number;
}

export type LookAtOptions = LookAtCoordinateOptions | LookAtFeatureOptions;

// ============================================================================
// ZoomTo
// ============================================================================

export type FeatureSelector = string[] | ((entity: Entity) => boolean);

interface ZoomToCoordinatesOptions {
  coordinates: Coordinate[];
  heading?: number;
  pitch?: number;
  duration?: number;
}

interface ZoomToFeaturesOptions {
  features: FeatureSelector;
  heading?: number;
  pitch?: number;
  duration?: number;
}

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
