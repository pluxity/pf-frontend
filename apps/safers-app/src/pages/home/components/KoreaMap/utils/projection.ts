import { geoMercator, geoPath, type GeoProjection, type GeoPath } from "d3-geo";
import { MAP_PROJECTION_SETTINGS, JEJU_BOUNDS } from "../constants";

interface ProjectionConfig {
  width: number;
  height: number;
  rootFontSize: number;
}

/** 본토용 Mercator 프로젝션 생성 */
export function createMainProjection(config: ProjectionConfig): GeoProjection {
  const { width, height, rootFontSize } = config;
  const settings = MAP_PROJECTION_SETTINGS.main;

  const baseScale = settings.referenceHeight * settings.scaleFactor * rootFontSize;

  return geoMercator()
    .center([settings.centerLng, settings.centerLat])
    .scale(baseScale)
    .translate([
      width / 2 + settings.translateXOffset * rootFontSize,
      height / 2 + settings.translateYOffset * rootFontSize,
    ]);
}

interface JejuProjectionConfig {
  insetX: number;
  insetY: number;
  insetWidth: number;
  insetHeight: number;
  rootFontSize: number;
}

/** 제주도 인셋용 Mercator 프로젝션 생성 */
export function createJejuProjection(config: JejuProjectionConfig): GeoProjection {
  const { insetX, insetY, insetWidth, insetHeight, rootFontSize } = config;
  const settings = MAP_PROJECTION_SETTINGS.jeju;

  const jejuScale = settings.scaleFactor * rootFontSize;

  return geoMercator()
    .center([settings.centerLng, settings.centerLat])
    .scale(jejuScale)
    .translate([insetX + insetWidth / 2, insetY + insetHeight / 2 + 0.5 * rootFontSize]);
}

/** 프로젝션에서 GeoPath 생성 */
export function createGeoPath(projection: GeoProjection): GeoPath {
  return geoPath().projection(projection);
}

/** 좌표가 제주도 영역인지 판별 */
export function isJejuCoords(latitude: number, longitude: number): boolean {
  return (
    latitude < JEJU_BOUNDS.maxLatitude &&
    longitude >= JEJU_BOUNDS.minLongitude &&
    longitude <= JEJU_BOUNDS.maxLongitude
  );
}

/** 좌표에 맞는 프로젝션 반환 */
export function getProjectionForCoords(
  latitude: number,
  longitude: number,
  mainProjection: GeoProjection,
  jejuProjection: GeoProjection | null
): GeoProjection {
  if (isJejuCoords(latitude, longitude) && jejuProjection) {
    return jejuProjection;
  }
  return mainProjection;
}

/** 좌표를 SVG 좌표로 변환 */
export function projectCoords(
  longitude: number,
  latitude: number,
  mainProjection: GeoProjection,
  jejuProjection: GeoProjection | null
): [number, number] | null {
  const projection = getProjectionForCoords(latitude, longitude, mainProjection, jejuProjection);
  return projection([longitude, latitude]);
}
