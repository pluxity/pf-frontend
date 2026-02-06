import type { FeatureCollection, Geometry } from "geojson";
import type { Selection, BaseType } from "d3-selection";
import type { GeoProjection } from "d3-geo";

/** 시도 GeoJSON Feature 속성 */
export interface SidoProperties {
  sido: string;
  sidonm: string;
  [key: string]: unknown;
}

/** 시도 GeoJSON Feature 타입 */
export type SidoFeature = GeoJSON.Feature<Geometry, SidoProperties>;

/** 시도 GeoJSON FeatureCollection 타입 */
export type SidoFeatureCollection = FeatureCollection<Geometry, SidoProperties>;

/** POI (Point of Interest) 데이터 */
export interface POI {
  id: string;
  longitude: number;
  latitude: number;
  label?: string;
  icon?: string;
  color?: string;
  size?: number;
  data?: Record<string, unknown>;
}

/** KoreaMap 컴포넌트 Props */
export interface KoreaMapProps {
  className?: string;
  pois?: POI[];
  onPOIClick?: (poi: POI) => void;
  onPOIHover?: (poi: POI | null) => void;
}

/** SVG Selection 타입 */
export type SVGSelection = Selection<SVGSVGElement, unknown, null, undefined>;

/** SVG Group Selection 타입 */
export type SVGGroupSelection = Selection<SVGGElement, unknown, null, undefined>;

/** D3 Selection 범용 타입 */
export type D3Selection<T extends BaseType = BaseType> = Selection<T, unknown, null, undefined>;

/** 지도 렌더러 반환 타입 */
export interface MapRendererResult {
  svgRef: React.MutableRefObject<SVGSelection | null>;
  mainProjectionRef: React.MutableRefObject<GeoProjection | null>;
  jejuProjectionRef: React.MutableRefObject<GeoProjection | null>;
  isLoading: boolean;
  coastlineScale: number;
}

/** POI 좌표 정보 */
export interface POICoords {
  x: number;
  y: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  color: string;
}
