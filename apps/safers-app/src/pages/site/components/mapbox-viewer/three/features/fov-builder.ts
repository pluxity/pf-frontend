import * as THREE from "three";
import type { SceneContext } from "../core/types";
import { COLOR_SUCCESS, FOV_DEFAULTS } from "../../../../config/assets.config";
import { GROUND_CLIP_PLANE } from "../materials";

interface FOVConfig {
  fovDeg: number;
  range: number;
  pitchDeg: number;
}

export function createFOVBuilder(ctx: SceneContext) {
  const fovConfigs = new Map<string, FOVConfig>();
  const fovMeshes = new Map<string, THREE.Mesh>();

  function buildFOVMesh(id: string) {
    const entry = ctx.features.get(id);
    const config = fovConfigs.get(id);
    if (!entry || !config) return;

    const existing = fovMeshes.get(id);
    const wasVisible = existing?.visible ?? false;
    if (existing) {
      existing.geometry.dispose();
      (existing.material as THREE.Material).dispose();
      entry.group.remove(existing);
      fovMeshes.delete(id);
    }

    const { fovDeg, range, pitchDeg } = config;
    const aspect = 16 / 9;
    const hHalf = (fovDeg / 2) * (Math.PI / 180);
    const vHalf = Math.atan(Math.tan(hHalf) / aspect);
    const pitchRad = -(pitchDeg * Math.PI) / 180;

    if (ctx.modelGroup) {
      const t = ctx.getTransform();
      const deg = Math.PI / 180;
      ctx.modelGroup.rotation.set(t.rotationX * deg, t.rotationY * deg, t.rotationZ * deg);
      ctx.modelGroup.scale.setScalar(t.scale);
    }

    ctx.scene.updateMatrixWorld(true);
    const groupWorld = entry.group.matrixWorld;
    const groupWorldInverse = groupWorld.clone().invert();
    const origin = new THREE.Vector3().setFromMatrixPosition(groupWorld);

    const targets: THREE.Object3D[] = [];
    if (ctx.modelGroup) targets.push(ctx.modelGroup);
    for (const [fId, f] of ctx.features) {
      if (fId !== id) targets.push(f.group);
    }

    const COLS = FOV_DEFAULTS.GRID_COLS;
    const ROWS = FOV_DEFAULTS.GRID_ROWS;
    const localVertices: THREE.Vector3[] = [];
    const prevFar = ctx.raycaster.far;

    for (let row = 0; row <= ROWS; row++) {
      for (let col = 0; col <= COLS; col++) {
        const u = col / COLS;
        const v = row / ROWS;

        const hAngle = -hHalf + u * 2 * hHalf;
        const vAngle = -vHalf + v * 2 * vHalf;

        const localDir = new THREE.Vector3(Math.tan(hAngle), Math.tan(vAngle), 1).normalize();

        const cosP = Math.cos(pitchRad);
        const sinP = Math.sin(pitchRad);
        const y2 = localDir.y * cosP - localDir.z * sinP;
        const z2 = localDir.y * sinP + localDir.z * cosP;
        localDir.y = y2;
        localDir.z = z2;
        localDir.normalize();

        const worldDir = localDir.clone().transformDirection(groupWorld);

        ctx.raycaster.set(origin, worldDir);
        ctx.raycaster.far = range;
        const hits = ctx.raycaster.intersectObjects(targets, true);
        const validHit = hits.find((h) => !h.object.userData.isFOV);
        const dist = validHit ? validHit.distance : range;

        const hitWorld = origin.clone().addScaledVector(worldDir, dist);
        localVertices.push(hitWorld.applyMatrix4(groupWorldInverse));
      }
    }

    ctx.raycaster.far = prevFar;

    const positions: number[] = [];

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const i00 = row * (COLS + 1) + col;
        const i10 = i00 + 1;
        const i01 = i00 + (COLS + 1);
        const i11 = i01 + 1;

        const v00 = localVertices[i00]!;
        const v10 = localVertices[i10]!;
        const v11 = localVertices[i11]!;
        const v01 = localVertices[i01]!;

        positions.push(v00.x, v00.y, v00.z, v10.x, v10.y, v10.z, v11.x, v11.y, v11.z);
        positions.push(v00.x, v00.y, v00.z, v11.x, v11.y, v11.z, v01.x, v01.y, v01.z);
      }
    }

    for (let col = 0; col < COLS; col++) {
      const t0 = localVertices[col]!;
      const t1 = localVertices[col + 1]!;
      positions.push(0, 0, 0, t0.x, t0.y, t0.z, t1.x, t1.y, t1.z);
      const b0 = localVertices[ROWS * (COLS + 1) + col]!;
      const b1 = localVertices[ROWS * (COLS + 1) + col + 1]!;
      positions.push(0, 0, 0, b1.x, b1.y, b1.z, b0.x, b0.y, b0.z);
    }
    for (let row = 0; row < ROWS; row++) {
      const l0 = localVertices[row * (COLS + 1)]!;
      const l1 = localVertices[(row + 1) * (COLS + 1)]!;
      positions.push(0, 0, 0, l1.x, l1.y, l1.z, l0.x, l0.y, l0.z);
      const r0 = localVertices[row * (COLS + 1) + COLS]!;
      const r1 = localVertices[(row + 1) * (COLS + 1) + COLS]!;
      positions.push(0, 0, 0, r0.x, r0.y, r0.z, r1.x, r1.y, r1.z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshBasicMaterial({
      color: COLOR_SUCCESS,
      transparent: true,
      opacity: FOV_DEFAULTS.OPACITY,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
      clippingPlanes: [GROUND_CLIP_PLANE],
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.isFOV = true;
    mesh.visible = wasVisible;

    entry.group.add(mesh);
    fovMeshes.set(id, mesh);
    ctx.requestRepaint();
  }

  function rebuildAllFOVs() {
    for (const id of fovConfigs.keys()) {
      if (ctx.features.has(id)) buildFOVMesh(id);
    }
  }

  function setFeatureFOV(id: string, fovDeg: number, range: number, pitchDeg = 0) {
    fovConfigs.set(id, { fovDeg, range, pitchDeg });
    buildFOVMesh(id);
  }

  function setFeatureFOVVisible(id: string, visible: boolean) {
    const mesh = fovMeshes.get(id);
    if (!mesh) return;
    mesh.visible = visible;
    ctx.requestRepaint();
  }

  function setFOVColor(id: string, color: number) {
    const mesh = fovMeshes.get(id);
    if (!mesh) return;
    (mesh.material as THREE.MeshBasicMaterial).color.set(color);
    ctx.requestRepaint();
  }

  function dispose() {
    fovMeshes.clear();
    fovConfigs.clear();
  }

  return {
    fovConfigs,
    fovMeshes,
    buildFOVMesh,
    rebuildAllFOVs,
    setFeatureFOV,
    setFeatureFOVVisible,
    setFOVColor,
    dispose,
  };
}
