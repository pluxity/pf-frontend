import { MercatorCoordinate } from "mapbox-gl";
import * as THREE from "three";
import type { RaycastHit, ScreenPosition } from "../../types";
import type { SceneContext } from "../core/types";
import { gpsToScenePosition } from "../core/geo-utils";
import { POPUP_HEAD_OFFSET } from "../../../../config/assets.config";

export function createProjection(ctx: SceneContext) {
  // Reusable objects to avoid per-frame allocation
  const _inverse = new THREE.Matrix4();
  const _near = new THREE.Vector3();
  const _far = new THREE.Vector3();
  const _projVec4 = new THREE.Vector4();
  const _projPos = new THREE.Vector3();

  function projectFeatureToScreen(
    id: string,
    width: number,
    height: number
  ): ScreenPosition | null {
    const entry = ctx.features.get(id);
    if (!entry || !ctx.lastCombinedMatrix) return null;

    _projPos.copy(entry.group.position);
    _projPos.z += POPUP_HEAD_OFFSET;

    _projVec4.set(_projPos.x, _projPos.y, _projPos.z, 1).applyMatrix4(ctx.lastCombinedMatrix);
    if (_projVec4.w <= 0) return null;

    return {
      x: ((_projVec4.x / _projVec4.w) * 0.5 + 0.5) * width,
      y: (-(_projVec4.y / _projVec4.w) * 0.5 + 0.5) * height,
    };
  }

  function getAllFeatureScreenPositions(
    width: number,
    height: number
  ): Map<string, ScreenPosition> {
    const result = new Map<string, ScreenPosition>();
    if (!ctx.lastCombinedMatrix) return result;

    for (const [id, entry] of ctx.features) {
      if (id.startsWith("dump-") || id.startsWith("crane-")) continue;
      _projPos.copy(entry.group.position);
      _projPos.z += POPUP_HEAD_OFFSET;
      _projVec4.set(_projPos.x, _projPos.y, _projPos.z, 1).applyMatrix4(ctx.lastCombinedMatrix);
      if (_projVec4.w <= 0) continue;
      result.set(id, {
        x: ((_projVec4.x / _projVec4.w) * 0.5 + 0.5) * width,
        y: (-(_projVec4.y / _projVec4.w) * 0.5 + 0.5) * height,
      });
    }
    return result;
  }

  function raycast(
    screenX: number,
    screenY: number,
    width: number,
    height: number,
    findFeatureId: (obj: THREE.Object3D) => string | null
  ): RaycastHit | null {
    if (!ctx.modelGroup || !ctx.lastCombinedMatrix || !ctx.lastModelTransformMat) return null;

    ctx.scene.updateMatrixWorld(true);

    const ndcX = (screenX / width) * 2 - 1;
    const ndcY = -(screenY / height) * 2 + 1;

    _inverse.copy(ctx.lastCombinedMatrix).invert();
    _near.set(ndcX, ndcY, -1).applyMatrix4(_inverse);
    _far.set(ndcX, ndcY, 1).applyMatrix4(_inverse);
    const direction = _far.sub(_near).normalize();

    ctx.raycaster.set(_near, direction);
    const targets: THREE.Object3D[] = [ctx.modelGroup];
    for (const [id, feature] of ctx.features) {
      if (id.startsWith("dump-") || id.startsWith("crane-")) continue;
      targets.push(feature.group);
    }
    const intersects = ctx.raycaster.intersectObjects(targets, true);
    const hit = intersects[0];
    if (!hit) return null;

    const hitPoint = hit.point;
    const mercatorPoint = hitPoint.clone().applyMatrix4(ctx.lastModelTransformMat);
    const mc = new MercatorCoordinate(mercatorPoint.x, mercatorPoint.y, mercatorPoint.z);
    const lngLat = mc.toLngLat();

    return {
      lng: lngLat.lng,
      lat: lngLat.lat,
      altitude: mc.toAltitude(),
      meshName: hit.object.name || "unknown",
      featureId: findFeatureId(hit.object) ?? undefined,
    };
  }

  function probeAltitude(lng: number, lat: number): number | null {
    if (!ctx.modelGroup) return null;
    const transform = ctx.getTransform();

    const ref0 = gpsToScenePosition({ lng, lat, altitude: 0 }, transform);
    const ref1 = gpsToScenePosition({ lng, lat, altitude: 1 }, transform);
    const metersPerUnit = 1 / (ref1.z - ref0.z);

    const origin = gpsToScenePosition({ lng, lat, altitude: 300 }, transform);
    const dir = new THREE.Vector3(0, 0, -1);

    const prevFar = ctx.raycaster.far;
    ctx.raycaster.set(origin, dir);
    ctx.raycaster.far = 600 / metersPerUnit;
    const hits = ctx.raycaster.intersectObject(ctx.modelGroup, true);
    ctx.raycaster.far = prevFar;

    if (hits.length === 0) return null;

    const hitZ = hits[0]!.point.z;
    return Math.round((hitZ - ref0.z) * metersPerUnit * 100) / 100;
  }

  return { projectFeatureToScreen, getAllFeatureScreenPositions, raycast, probeAltitude };
}
