import type { Color, HeightReference } from "cesium";
import type { DisplayConditionRange } from "./feature";

// ============================================================================
// GeoJSON Standard Types (RFC 7946 subset)
// ============================================================================

export interface GeoJsonPolygonGeometry {
  type: "Polygon";
  coordinates: number[][][];
}

export interface GeoJsonMultiPolygonGeometry {
  type: "MultiPolygon";
  coordinates: number[][][][];
}

export type GeoJsonGeometry = GeoJsonPolygonGeometry | GeoJsonMultiPolygonGeometry;

export interface GeoJsonFeature<G extends GeoJsonGeometry = GeoJsonGeometry> {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: G;
}

export interface GeoJsonFeatureCollection<G extends GeoJsonGeometry = GeoJsonGeometry> {
  type: "FeatureCollection";
  features: GeoJsonFeature<G>[];
}

// ============================================================================
// GeoJsonLayer Props
// ============================================================================

export interface GeoJsonLayerStyle {
  fill?: boolean;
  fillColor?: Color;
  fillOpacity?: number;
  outline?: boolean;
  outlineColor?: Color;
  outlineWidth?: number;
  extrudedHeight?: number;
  heightReference?: HeightReference;
  distanceDisplayCondition?: DisplayConditionRange;
}

export interface GeoJsonLayerProps {
  /** GeoJSON data object or URL string */
  data: GeoJsonFeatureCollection | string;
  /** Layer identifier */
  layerName: string;
  /** Default polygon style */
  style?: GeoJsonLayerStyle;
  /** Per-feature style override */
  styleResolver?: (feature: GeoJsonFeature, index: number) => Partial<GeoJsonLayerStyle>;
  /** Show/hide layer */
  show?: boolean;
  /** Load complete callback */
  onReady?: (entityCount: number) => void;
  /** Error callback */
  onError?: (error: Error) => void;
}

// ============================================================================
// GeoJsonMarkers Props
// ============================================================================

export interface GeoJsonScaleByDistance {
  near: number;
  nearScale: number;
  far: number;
  farScale: number;
}

export interface GeoJsonMarkerStyle {
  image: string;
  selectedImage?: string;
  width?: number;
  height?: number;
  scale?: number;
  scaleByDistance?: GeoJsonScaleByDistance;
  disableDepthTestDistance?: number;
  heightReference?: HeightReference;
  distanceDisplayCondition?: DisplayConditionRange;
}

export interface GeoJsonMarkersProps {
  /** GeoJSON layer name to derive positions from */
  layerName: string;
  /** Marker style */
  style: GeoJsonMarkerStyle;
  /** Show/hide markers */
  show?: boolean;
  /** Click callback */
  onClick?: (featureId: string, properties: Record<string, unknown>) => void;
}
