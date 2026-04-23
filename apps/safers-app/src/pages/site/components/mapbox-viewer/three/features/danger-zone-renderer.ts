import * as THREE from "three";
import type { SceneContext } from "../core/types";
import { gpsToScenePosition } from "../core/geo-utils";

interface DangerZoneInput {
  id: string;
  name: string;
  coordinates: [number, number][];
}

export function createDangerZoneRenderer(ctx: SceneContext) {
  const dangerZoneGroups = new Map<string, THREE.Group>();

  function disposeGroups() {
    for (const group of dangerZoneGroups.values()) {
      ctx.scene.remove(group);
      group.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
          child.geometry.dispose();
          const mat = child.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else (mat as THREE.Material).dispose();
        }
        if (child instanceof THREE.Sprite) {
          const mat = child.material as THREE.SpriteMaterial;
          mat.map?.dispose();
          mat.dispose();
        }
      });
    }
    dangerZoneGroups.clear();
  }

  function setDangerZones(zones: DangerZoneInput[]) {
    disposeGroups();

    const t = ctx.getTransform();

    for (const zone of zones) {
      const coords = zone.coordinates;
      if (coords.length < 3) continue;

      const scenePoints = coords.map((c) =>
        gpsToScenePosition({ lng: c[0], lat: c[1], altitude: 0.15 }, t)
      );

      const group = new THREE.Group();
      group.userData.isDangerZone = true;

      const shape = new THREE.Shape();
      shape.moveTo(scenePoints[0]!.x, scenePoints[0]!.y);
      for (let i = 1; i < scenePoints.length; i++) {
        shape.lineTo(scenePoints[i]!.x, scenePoints[i]!.y);
      }
      shape.closePath();

      const fillGeo = new THREE.ShapeGeometry(shape);
      const fillMat = new THREE.MeshBasicMaterial({
        color: 0xde4545,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const fillMesh = new THREE.Mesh(fillGeo, fillMat);
      fillMesh.position.z = scenePoints[0]!.z;
      fillMesh.raycast = () => {};
      group.add(fillMesh);

      const linePoints = [...scenePoints, scenePoints[0]!];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xde4545,
        linewidth: 2,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.raycast = () => {};
      group.add(line);

      ctx.scene.add(group);
      dangerZoneGroups.set(zone.id, group);
    }

    ctx.requestRepaint();
  }

  function dispose() {
    disposeGroups();
  }

  return { setDangerZones, dispose };
}
