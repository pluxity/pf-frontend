import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import type { Observer } from "@babylonjs/core/Misc/observable";
import {
  getPositionOnPath,
  type EmergencyRouteManager,
  type RoutePathData,
} from "./emergency-route";

const EVACUEES_PER_ROUTE = 7;
const BASE_SPEED = 6; // world units per second
const STAGGER_OFFSET = 0.07; // progress offset between consecutive evacuees
const HEAD_RADIUS = 0.2;
const BODY_HEIGHT = 0.9;
const BODY_RADIUS = 0.17;

interface Evacuee {
  root: TransformNode;
  headMesh: Mesh;
  bodyMesh: Mesh;
  headMat: StandardMaterial;
  bodyMat: StandardMaterial;
  progress: number;
  speed: number;
  routeId: string;
  pathData: RoutePathData;
  arrived: boolean;
}

export interface EvacuationSimulation {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  dispose(): void;
}

export function createEvacuationSimulation(
  scene: Scene,
  glowLayer: GlowLayer,
  routeMgr: EmergencyRouteManager
): EvacuationSimulation {
  let evacuees: Evacuee[] = [];
  let observer: Observer<Scene> | null = null;
  let running = false;

  function start(): void {
    if (running) return;
    running = true;

    // Get all currently visible routes
    const visibleIds = routeMgr.getVisibleRouteIds();

    for (const routeId of visibleIds) {
      const pathData = routeMgr.getRouteData(routeId);
      if (!pathData) continue;

      // Brighten route color for evacuee visibility
      const baseColor = pathData.color.scale(0.8).add(new Color3(0.2, 0.2, 0.2));

      for (let i = 0; i < EVACUEES_PER_ROUTE; i++) {
        const evacuee = createEvacuee(routeId, pathData, baseColor, i);
        evacuees.push(evacuee);
      }
    }

    // Start render loop
    observer = scene.onBeforeRenderObservable.add(() => {
      const dt = scene.getEngine().getDeltaTime() / 1000;
      updateEvacuees(dt);
    });
  }

  function createEvacuee(
    routeId: string,
    pathData: RoutePathData,
    color: Color3,
    index: number
  ): Evacuee {
    const root = new TransformNode(`evacuee-${routeId}-${index}`, scene);

    // Head (sphere)
    const headMat = new StandardMaterial(`evacuee-head-mat-${routeId}-${index}`, scene);
    headMat.diffuseColor = color.scale(1.1);
    headMat.emissiveColor = color.scale(0.3);

    const headMesh = MeshBuilder.CreateSphere(
      `evacuee-head-${routeId}-${index}`,
      { diameter: HEAD_RADIUS * 2, segments: 6 },
      scene
    );
    headMesh.material = headMat;
    headMesh.position.y = BODY_HEIGHT + HEAD_RADIUS;
    headMesh.isPickable = false;
    headMesh.parent = root;

    // Body (cylinder)
    const bodyMat = new StandardMaterial(`evacuee-body-mat-${routeId}-${index}`, scene);
    bodyMat.diffuseColor = color;
    bodyMat.emissiveColor = color.scale(0.2);

    const bodyMesh = MeshBuilder.CreateCylinder(
      `evacuee-body-${routeId}-${index}`,
      { height: BODY_HEIGHT, diameter: BODY_RADIUS * 2, tessellation: 8 },
      scene
    );
    bodyMesh.material = bodyMat;
    bodyMesh.position.y = BODY_HEIGHT / 2;
    bodyMesh.isPickable = false;
    bodyMesh.parent = root;

    glowLayer.addIncludedOnlyMesh(headMesh);

    // Staggered start: negative progress means waiting
    const progress = -index * STAGGER_OFFSET;
    // Individual speed variation
    const speed = BASE_SPEED * (0.85 + Math.random() * 0.3);

    // Initially hidden (will show when progress >= 0)
    root.setEnabled(false);

    return {
      root,
      headMesh,
      bodyMesh,
      headMat,
      bodyMat,
      progress,
      speed,
      routeId,
      pathData,
      arrived: false,
    };
  }

  function updateEvacuees(dt: number): void {
    for (const ev of evacuees) {
      if (ev.arrived) continue;

      ev.progress += (ev.speed * dt) / ev.pathData.totalLen;

      if (ev.progress < 0) {
        // Still waiting to start
        ev.root.setEnabled(false);
        continue;
      }

      if (ev.progress >= 1) {
        // Arrived at assembly point
        ev.arrived = true;
        ev.progress = 1;
        // Make slightly transparent
        ev.headMat.alpha = 0.4;
        ev.bodyMat.alpha = 0.4;
      }

      ev.root.setEnabled(true);

      // Position on path
      const pos = getPositionOnPath(ev.pathData, Math.min(ev.progress, 1));
      ev.root.position.copyFrom(pos);

      // Face movement direction (look-ahead)
      const lookAhead = Math.min(ev.progress + 0.02, 1);
      if (lookAhead > ev.progress) {
        const nextPos = getPositionOnPath(ev.pathData, lookAhead);
        const dir = nextPos.subtract(pos);
        if (dir.lengthSquared() > 0.001) {
          const angle = Math.atan2(dir.x, dir.z);
          ev.root.rotation.y = angle;
        }
      }
    }
  }

  function stop(): void {
    if (!running) return;
    running = false;

    if (observer) {
      scene.onBeforeRenderObservable.remove(observer);
      observer = null;
    }

    for (const ev of evacuees) {
      ev.headMat.dispose();
      ev.bodyMat.dispose();
      ev.headMesh.dispose();
      ev.bodyMesh.dispose();
      ev.root.dispose();
    }
    evacuees = [];
  }

  function isRunning(): boolean {
    return running;
  }

  function dispose(): void {
    stop();
  }

  return { start, stop, isRunning, dispose };
}
