import * as THREE from "three";
import type { SceneContext } from "../core/types";
import type { FeaturePosition } from "../../types";
import { gpsToScenePosition } from "../core/geo-utils";
import { COLOR_SUCCESS, FOV_DEFAULTS } from "../../../../config/assets.config";
import { GROUND_CLIP_PLANE } from "../materials";

interface FrustumConfig {
  corners: [FeaturePosition, FeaturePosition, FeaturePosition, FeaturePosition];
}

export function createFOVBuilder(ctx: SceneContext) {
  const frustumConfigs = new Map<string, FrustumConfig>();
  const fovGroups = new Map<string, THREE.Group>();

  /**
   * 정적 프러스텀(사각뿔) 메시 생성.
   * apex = feature group 원점 (0,0,0), base = 4개 GPS 코너를 로컬 좌표로 변환.
   * 삼각형 6개: 측면 4 + 밑면 2.
   */
  function buildFrustumMesh(id: string) {
    const entry = ctx.features.get(id);
    const config = frustumConfigs.get(id);
    if (!entry || !config) return;

    const existing = fovGroups.get(id);
    const wasVisible = existing?.visible ?? false;
    if (existing) {
      existing.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      entry.group.remove(existing);
      fovGroups.delete(id);
    }

    const transform = ctx.getTransform();

    // group의 회전(rotation.x=π/2, rotation.y=heading)과 스케일을 반영하여
    // 씬 좌표를 group 로컬 좌표로 정확히 변환
    entry.group.updateMatrixWorld(true);
    const localCorners = config.corners.map((corner) => {
      const scenePos = gpsToScenePosition(corner, transform);
      return entry.group.worldToLocal(scenePos);
    });

    const [tl, tr, br, bl] = localCorners as [
      THREE.Vector3,
      THREE.Vector3,
      THREE.Vector3,
      THREE.Vector3,
    ];

    // apex = (0,0,0) — feature group 원점 (CCTV 위치)
    const positions: number[] = [];

    // 측면 4개 삼각형 (apex → 인접 코너 쌍)
    // top: tl → tr
    positions.push(0, 0, 0, tl.x, tl.y, tl.z, tr.x, tr.y, tr.z);
    // right: tr → br
    positions.push(0, 0, 0, tr.x, tr.y, tr.z, br.x, br.y, br.z);
    // bottom: br → bl
    positions.push(0, 0, 0, br.x, br.y, br.z, bl.x, bl.y, bl.z);
    // left: bl → tl
    positions.push(0, 0, 0, bl.x, bl.y, bl.z, tl.x, tl.y, tl.z);

    // 밑면 2개 삼각형
    positions.push(tl.x, tl.y, tl.z, br.x, br.y, br.z, tr.x, tr.y, tr.z);
    positions.push(tl.x, tl.y, tl.z, bl.x, bl.y, bl.z, br.x, br.y, br.z);

    // --- 면 (반투명 삼각형) ---
    const faceGeometry = new THREE.BufferGeometry();
    faceGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    faceGeometry.computeVertexNormals();

    const faceMaterial = new THREE.MeshBasicMaterial({
      color: COLOR_SUCCESS,
      transparent: true,
      opacity: FOV_DEFAULTS.OPACITY,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
      clippingPlanes: [GROUND_CLIP_PLANE],
    });

    const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);

    // --- 선 (엣지 라인) ---
    const apex = new THREE.Vector3(0, 0, 0);
    const linePositions = new Float32Array([
      // apex → 4 corners
      apex.x,
      apex.y,
      apex.z,
      tl.x,
      tl.y,
      tl.z,
      apex.x,
      apex.y,
      apex.z,
      tr.x,
      tr.y,
      tr.z,
      apex.x,
      apex.y,
      apex.z,
      br.x,
      br.y,
      br.z,
      apex.x,
      apex.y,
      apex.z,
      bl.x,
      bl.y,
      bl.z,
      // base edges
      tl.x,
      tl.y,
      tl.z,
      tr.x,
      tr.y,
      tr.z,
      tr.x,
      tr.y,
      tr.z,
      br.x,
      br.y,
      br.z,
      br.x,
      br.y,
      br.z,
      bl.x,
      bl.y,
      bl.z,
      bl.x,
      bl.y,
      bl.z,
      tl.x,
      tl.y,
      tl.z,
    ]);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: COLOR_SUCCESS,
      transparent: true,
      opacity: 0.8,
      depthTest: true,
      clippingPlanes: [GROUND_CLIP_PLANE],
    });

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);

    // --- Group으로 묶기 ---
    const fovGroup = new THREE.Group();
    fovGroup.userData.isFOV = true;
    fovGroup.add(faceMesh);
    fovGroup.add(lineSegments);
    fovGroup.visible = wasVisible;

    entry.group.add(fovGroup);
    fovGroups.set(id, fovGroup);
    ctx.requestRepaint();
  }

  function setFeatureFrustum(
    id: string,
    corners: [FeaturePosition, FeaturePosition, FeaturePosition, FeaturePosition]
  ) {
    frustumConfigs.set(id, { corners });
    buildFrustumMesh(id);
  }

  /** @deprecated 레이캐스팅 FOV는 정적 프러스텀으로 대체됨. setFeatureFrustum을 사용하세요. */
  function setFeatureFOV(_id: string, _fovDeg: number, _range: number, _pitchDeg = 0) {
    // no-op — 레이캐스팅 방식 제거됨
  }

  function setFeatureFOVVisible(id: string, visible: boolean) {
    const group = fovGroups.get(id);
    if (!group) return;
    group.visible = visible;
    ctx.requestRepaint();
  }

  function setFOVColor(id: string, color: number) {
    const group = fovGroups.get(id);
    if (!group) return;
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshBasicMaterial).color.set(color);
      } else if (child instanceof THREE.LineSegments) {
        (child.material as THREE.LineBasicMaterial).color.set(color);
      }
    });
    ctx.requestRepaint();
  }

  function dispose() {
    for (const [id, group] of fovGroups) {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      const entry = ctx.features.get(id);
      if (entry) entry.group.remove(group);
    }
    fovGroups.clear();
    frustumConfigs.clear();
  }

  return {
    frustumConfigs,
    fovGroups,
    setFeatureFrustum,
    setFeatureFOV,
    setFeatureFOVVisible,
    setFOVColor,
    dispose,
  };
}
