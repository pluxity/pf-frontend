import { useEffect, useRef } from "react";
import { Canvas, GLTFModel } from "@pf-dev/three";
import { traverseMeshes } from "@pf-dev/three";
import type { Group, MeshStandardMaterial, Object3D } from "three";
import type { ConstructionSchedule } from "./types";
import { useTimelapseStore, resolveCurrentPhases, getLeafPaths } from "./timelapse.store";

const MODEL_URL = "/assets/models/timelapse.glb";

function buildMeshPath(obj: Object3D, root: Object3D): string {
  const parts: string[] = [];
  let current: Object3D | null = obj;
  while (current && current !== root) {
    if (current.name) parts.unshift(current.name);
    current = current.parent;
  }
  return parts.join("/");
}

function findLeafPath(meshPath: string, leafPathSet: Set<string>): string | null {
  if (leafPathSet.has(meshPath)) return meshPath;
  const parts = meshPath.split("/");
  for (let i = parts.length - 1; i >= 1; i--) {
    const parentPath = parts.slice(0, i).join("/");
    if (leafPathSet.has(parentPath)) return parentPath;
  }
  return null;
}

function makeGroundTranslucent(scene: Group) {
  traverseMeshes(scene, (mesh) => {
    const path = buildMeshPath(mesh, scene);
    if (path !== "Ground" && !path.startsWith("Ground/")) return;
    const mats = (
      Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    ) as MeshStandardMaterial[];
    for (const mat of mats) {
      mat.transparent = true;
      mat.opacity = 0.7;
    }
  });
}

function applyScheduleToScene(scene: Group, schedule: ConstructionSchedule, currentDate: Date) {
  const phases = resolveCurrentPhases(schedule, currentDate);
  const leafPathSet = new Set(getLeafPaths(schedule));

  traverseMeshes(scene, (mesh) => {
    const meshPath = buildMeshPath(mesh, scene);

    if (
      meshPath === "Ground" ||
      meshPath.startsWith("Ground/") ||
      meshPath.includes("BDG_MXD_BF1")
    ) {
      mesh.visible = true;
      return;
    }

    const matchedPath = findLeafPath(meshPath, leafPathSet);
    if (!matchedPath) {
      mesh.visible = false;
      return;
    }

    mesh.visible = !!phases.get(matchedPath);
  });
}

function SceneContent() {
  const sceneRef = useRef<Group | null>(null);
  const currentDate = useTimelapseStore((s) => s.currentDate);
  const schedule = useTimelapseStore((s) => s.schedule);

  useEffect(() => {
    if (!sceneRef.current || !schedule) return;
    applyScheduleToScene(sceneRef.current, schedule, currentDate);
  }, [currentDate, schedule]);

  return (
    <GLTFModel
      url={MODEL_URL}
      autoAddToStore={false}
      castShadow={false}
      receiveShadow={false}
      onLoaded={(gltf) => {
        makeGroundTranslucent(gltf.scene);
        sceneRef.current = gltf.scene;
        if (schedule) applyScheduleToScene(gltf.scene, schedule, currentDate);
      }}
    />
  );
}

export function TimelapseViewer() {
  return (
    <div className="h-full w-full">
      <Canvas
        background="#FFF8F2"
        lighting={false}
        controls={{
          enableDamping: true,
          dampingFactor: 0.1,
          target: [40.2, 27.4, -10.3] as [number, number, number],
        }}
        camera={{ position: [7.2, 97.3, 99.1] as [number, number, number], fov: 50 }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 50, 0]} intensity={2} />
        <SceneContent />
      </Canvas>
    </div>
  );
}
