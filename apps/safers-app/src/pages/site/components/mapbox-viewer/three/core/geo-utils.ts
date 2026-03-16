import { MercatorCoordinate } from "mapbox-gl";
import * as THREE from "three";
import type { FeaturePosition, ModelTransform } from "../../types";

export function gpsToScenePosition(
  position: FeaturePosition,
  transform: ModelTransform
): THREE.Vector3 {
  const featureMerc = MercatorCoordinate.fromLngLat(
    [position.lng, position.lat],
    position.altitude
  );
  const originMerc = MercatorCoordinate.fromLngLat(
    [transform.lng, transform.lat],
    transform.altitude
  );
  const s = originMerc.meterInMercatorCoordinateUnits();

  return new THREE.Vector3(
    (featureMerc.x - originMerc.x) / s,
    (originMerc.y - featureMerc.y) / s,
    ((featureMerc.z ?? 0) - (originMerc.z ?? 0)) / s
  );
}

const OCCLUSION_DIRECTIONS = [
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
];

export function checkOcclusionAt(
  position: THREE.Vector3,
  target: THREE.Object3D,
  raycaster: THREE.Raycaster,
  maxDistance = 8
): boolean {
  const prevFar = raycaster.far;
  let blocked = 0;

  for (const dir of OCCLUSION_DIRECTIONS) {
    raycaster.set(position, dir);
    raycaster.far = maxDistance;
    const hits = raycaster.intersectObject(target, true);
    if (hits.length > 0) blocked++;
  }

  raycaster.far = prevFar;
  return blocked >= 4;
}
