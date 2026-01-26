import * as THREE from "three";
import type { GISCoordinate } from "../types";

export function gisToLocal(gis: GISCoordinate, offset: THREE.Vector3): THREE.Vector3 {
  const local = {
    x: gis.x - offset.x,
    y: gis.y - offset.y,
    z: gis.z - offset.z,
  };
  return new THREE.Vector3(local.x, local.z, -local.y);
}

export function localToGIS(point: THREE.Vector3, offset: THREE.Vector3): GISCoordinate {
  return {
    x: point.x + offset.x,
    y: -point.z + offset.y,
    z: point.y + offset.z,
  };
}

export function calculateOffset(
  potreePosition: THREE.Vector3,
  bboxCenter: THREE.Vector3
): THREE.Vector3 {
  return new THREE.Vector3(
    potreePosition.x + bboxCenter.x,
    potreePosition.y + bboxCenter.y,
    potreePosition.z + bboxCenter.z
  );
}
