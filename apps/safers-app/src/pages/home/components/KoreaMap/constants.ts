/** 지도 GeoJSON 경로 */
export const SIDO_GEOJSON_PATH = "/geojson/sido_no_islands_ver20260201_optimized.geojson";

/** 제주도 시도 코드 */
export const JEJU_CODE = "50";

/** 지도 색상 */
export const MAP_COLORS = {
  region: "#FFFFFF",
  stroke: "#A4A9C2",
  brand: "#FF7500",
  shadow: "#3A4A5A",
  defaultPOI: "#4D7EFF",
} as const;

/** 지도 프로젝션 설정 */
export const MAP_PROJECTION_SETTINGS = {
  main: {
    centerLng: 127.8,
    centerLat: 36.2,
    scaleFactor: 0.55,
    referenceHeight: 1080,
    translateXOffset: -9.5,
    translateYOffset: 7,
  },
  jeju: {
    centerLng: 126.55,
    centerLat: 33.38,
    scaleFactor: 350,
  },
} as const;

/** POI 마커 SVG 설정 */
export const POI_MARKER = {
  path: "M14.5 1C20.8513 1 26 6.22371 26 12.667C25.9999 15.9322 24.676 18.8824 22.5449 21H22.5479L14.5 31L6.50391 21.0469C4.34468 18.9261 3.00011 15.9567 3 12.667C3 6.22374 8.14872 1.00005 14.5 1Z",
  width: 30,
  height: 31,
  anchorX: 14.5,
  anchorY: 12.5,
  innerRadius: 6.5,
} as const;

/** 제주도 판별 기준 좌표 */
export const JEJU_BOUNDS = {
  maxLatitude: 34.0,
  minLongitude: 125.5,
  maxLongitude: 127.5,
} as const;

/** SVG 필터 정의 */
export const SVG_FILTERS = `
  <filter id="region-shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="#5A6A7A" flood-opacity="0.4"/>
  </filter>
  <filter id="inset-shadow" x="-10%" y="-10%" width="120%" height="120%">
    <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#5A6A7A" flood-opacity="0.3"/>
  </filter>
  <filter id="poi-shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
  </filter>
`;
