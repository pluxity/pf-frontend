import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import type { Observer } from "@babylonjs/core/Misc/observable";
import { EMERGENCY_ROUTES, type EmergencyRouteConfig } from "@/config/emergency-routes.config";

const MARKERS_PER_ROUTE = 4;
const MARKER_SIZE = 0.5;
const EXIT_MARKER_SIZE = 1.0;
const TUBE_RADIUS = 0.25;
const MARKER_SPEED = 0.4;

interface RouteVisual {
  tube: Mesh;
  markers: { mesh: Mesh; material: StandardMaterial; progress: number }[];
  exitMarker: Mesh;
  exitMaterial: StandardMaterial;
  waypoints: Vector3[];
  segLens: number[];
  totalLen: number;
  visible: boolean;
}

export interface RoutePathData {
  waypoints: Vector3[];
  segLens: number[];
  totalLen: number;
  color: Color3;
}

export interface EmergencyRouteManager {
  showRoute(routeId: string): void;
  showAllRoutes(): void;
  hideRoute(routeId: string): void;
  hideAllRoutes(): void;
  getRouteData(routeId: string): RoutePathData | null;
  getVisibleRouteIds(): string[];
  dispose(): void;
}

/** Compute a position along a path defined by waypoints/segLens/totalLen at given progress [0,1]. */
export function getPositionOnPath(
  pathData: { waypoints: Vector3[]; segLens: number[]; totalLen: number },
  progress: number
): Vector3 {
  const target = progress * pathData.totalLen;
  let accumulated = 0;

  for (let i = 0; i < pathData.segLens.length; i++) {
    const segLen = pathData.segLens[i]!;
    if (accumulated + segLen >= target) {
      const t = segLen > 0 ? (target - accumulated) / segLen : 0;
      return Vector3.Lerp(pathData.waypoints[i]!, pathData.waypoints[i + 1]!, t);
    }
    accumulated += segLen;
  }
  return pathData.waypoints[pathData.waypoints.length - 1]!.clone();
}

export function createEmergencyRouteManager(
  scene: Scene,
  glowLayer: GlowLayer
): EmergencyRouteManager {
  const routes = new Map<string, RouteVisual>();
  let observer: Observer<Scene> | null = null;

  // Pre-build all route visuals (initially hidden)
  for (const config of EMERGENCY_ROUTES) {
    const visual = buildRouteVisual(config);
    routes.set(config.id, visual);
  }

  // Start animation loop
  observer = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    const time = performance.now() / 1000;

    for (const route of routes.values()) {
      if (!route.visible) continue;

      // Animate direction markers along path
      for (const marker of route.markers) {
        marker.progress += (MARKER_SPEED * dt) / route.totalLen;
        if (marker.progress >= 1) {
          marker.progress -= 1;
        }

        const pos = getPositionOnPath(route, marker.progress);
        marker.mesh.position.copyFrom(pos);

        // Subtle pulse
        const pulse = 1 + 0.2 * Math.sin(marker.progress * Math.PI * 4);
        marker.mesh.scaling.setAll(pulse);
      }

      // Exit marker blink
      const blink = 0.5 + 0.5 * Math.sin(time * 6);
      route.exitMaterial.emissiveColor = Color3.Green().scale(blink);
    }
  });

  function buildRouteVisual(config: EmergencyRouteConfig): RouteVisual {
    const waypoints = config.waypoints.map((wp) => new Vector3(wp.x, wp.y, wp.z));
    const color = Color3.FromHexString(config.color);

    // Calculate segment lengths
    const segLens: number[] = [];
    let totalLen = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const len = Vector3.Distance(waypoints[i - 1]!, waypoints[i]!);
      segLens.push(len);
      totalLen += len;
    }

    // --- Tube (route path) ---
    const path = waypoints.map((wp) => wp.clone());
    const tube = MeshBuilder.CreateTube(
      `emergency-tube-${config.id}`,
      { path, radius: TUBE_RADIUS, tessellation: 8, cap: 0, updatable: false },
      scene
    );
    const tubeMat = new StandardMaterial(`emergency-tube-mat-${config.id}`, scene);
    tubeMat.diffuseColor = color.scale(0.5);
    tubeMat.emissiveColor = color.scale(0.3);
    tubeMat.alpha = 0.4;
    tube.material = tubeMat;
    tube.isPickable = false;
    tube.setEnabled(false);

    // --- Direction markers (glowing spheres traveling along the route) ---
    const markers: RouteVisual["markers"] = [];
    for (let i = 0; i < MARKERS_PER_ROUTE; i++) {
      const mat = new StandardMaterial(`emergency-marker-mat-${config.id}-${i}`, scene);
      mat.diffuseColor = color;
      mat.emissiveColor = color.scale(0.9);
      mat.alpha = 0.95;

      const sphere = MeshBuilder.CreateSphere(
        `emergency-marker-${config.id}-${i}`,
        { diameter: MARKER_SIZE, segments: 6 },
        scene
      );
      sphere.material = mat;
      sphere.isPickable = false;
      sphere.setEnabled(false);

      glowLayer.addIncludedOnlyMesh(sphere);

      markers.push({
        mesh: sphere,
        material: mat,
        progress: i / MARKERS_PER_ROUTE,
      });
    }

    // --- Exit marker (green blinking sphere at destination) ---
    const exitPos = waypoints[waypoints.length - 1]!;
    const exitMat = new StandardMaterial(`emergency-exit-mat-${config.id}`, scene);
    exitMat.diffuseColor = Color3.Green();
    exitMat.emissiveColor = Color3.Green();

    const exitMarker = MeshBuilder.CreateSphere(
      `emergency-exit-${config.id}`,
      { diameter: EXIT_MARKER_SIZE, segments: 8 },
      scene
    );
    exitMarker.material = exitMat;
    exitMarker.position = exitPos.clone();
    exitMarker.position.y += 0.5;
    exitMarker.isPickable = false;
    exitMarker.setEnabled(false);

    glowLayer.addIncludedOnlyMesh(exitMarker);

    return {
      tube,
      markers,
      exitMarker,
      exitMaterial: exitMat,
      waypoints,
      segLens,
      totalLen,
      visible: false,
    };
  }

  function setRouteVisible(route: RouteVisual, visible: boolean): void {
    route.visible = visible;
    route.tube.setEnabled(visible);
    route.exitMarker.setEnabled(visible);
    for (const marker of route.markers) {
      marker.mesh.setEnabled(visible);
    }
  }

  function showRoute(routeId: string): void {
    const route = routes.get(routeId);
    if (route) setRouteVisible(route, true);
  }

  function showAllRoutes(): void {
    for (const route of routes.values()) {
      setRouteVisible(route, true);
    }
  }

  function hideRoute(routeId: string): void {
    const route = routes.get(routeId);
    if (route) setRouteVisible(route, false);
  }

  function hideAllRoutes(): void {
    for (const route of routes.values()) {
      setRouteVisible(route, false);
    }
  }

  function dispose(): void {
    if (observer) {
      scene.onBeforeRenderObservable.remove(observer);
      observer = null;
    }
    for (const route of routes.values()) {
      route.tube.material?.dispose();
      route.tube.dispose();
      route.exitMaterial.dispose();
      route.exitMarker.dispose();
      for (const marker of route.markers) {
        marker.material.dispose();
        marker.mesh.dispose();
      }
    }
    routes.clear();
  }

  function getRouteData(routeId: string): RoutePathData | null {
    const route = routes.get(routeId);
    if (!route) return null;
    return {
      waypoints: route.waypoints,
      segLens: route.segLens,
      totalLen: route.totalLen,
      color: Color3.FromHexString(
        EMERGENCY_ROUTES.find((r) => r.id === routeId)?.color ?? "#FF4444"
      ),
    };
  }

  function getVisibleRouteIds(): string[] {
    const ids: string[] = [];
    for (const [id, route] of routes) {
      if (route.visible) ids.push(id);
    }
    return ids;
  }

  return {
    showRoute,
    showAllRoutes,
    hideRoute,
    hideAllRoutes,
    getRouteData,
    getVisibleRouteIds,
    dispose,
  };
}
