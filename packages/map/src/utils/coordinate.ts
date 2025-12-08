import { Cartesian3, Cartographic, Ellipsoid, Math as CesiumMath } from "cesium";
import type { Coordinate } from "../types.ts";

/**
 * Coordinate를 Cartesian3로 변환
 */
export function coordinateToCartesian3(coord: Coordinate): Cartesian3 {
  return Cartesian3.fromDegrees(coord.longitude, coord.latitude, coord.height ?? 0);
}

/**
 * Cartesian3를 Coordinate로 변환
 */
export function cartesian3ToCoordinate(cartesian: Cartesian3): Coordinate {
  const cartographic = Ellipsoid.WGS84.cartesianToCartographic(cartesian) as Cartographic;

  return {
    longitude: CesiumMath.toDegrees(cartographic.longitude),
    latitude: CesiumMath.toDegrees(cartographic.latitude),
    height: cartographic.height,
  };
}
