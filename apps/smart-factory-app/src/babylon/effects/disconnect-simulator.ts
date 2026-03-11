import { ParticleSystem } from "@babylonjs/core/Particles/particleSystem";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { CableRouteConfig } from "../types";
import { CABLE_DOWNSTREAM, PANELS } from "@/config/electrical.config";

import "@babylonjs/core/Particles/particleSystemComponent";

interface DisconnectState {
  originalColor: Color3;
  disconnected: boolean;
}

/**
 * Create disconnect simulator: cable disconnect with spark + cascade.
 */
export function createDisconnectSimulator(
  scene: Scene,
  cables: Map<string, Mesh>,
  flowEffect: { stopCableFlow: (id: string) => void; resumeCableFlow: (id: string) => void },
  panels: Map<string, TransformNode>,
  routes: CableRouteConfig[]
) {
  const cableStates = new Map<string, DisconnectState>();
  const sparkSystems: ParticleSystem[] = [];

  // Store original cable colors
  for (const [id, cable] of cables) {
    const mat = cable.material as StandardMaterial | null;
    cableStates.set(id, {
      originalColor: mat?.diffuseColor?.clone() ?? new Color3(0.3, 0.5, 1),
      disconnected: false,
    });
  }

  /** Get all downstream cable IDs recursively */
  function getDownstreamCables(cableId: string): string[] {
    const result: string[] = [];
    const children = CABLE_DOWNSTREAM[cableId];
    if (!children) return result;

    for (const childId of children) {
      result.push(childId);
      result.push(...getDownstreamCables(childId));
    }
    return result;
  }

  /** Find the destination panel's building panels for indicator graying */
  function getAffectedPanelIds(cableId: string): string[] {
    const route = routes.find((r) => r.id === cableId);
    if (!route) return [];

    const panelIds: string[] = [];
    // The destination panel
    panelIds.push(route.toId);

    // All panels that are children of the destination
    const queue = [route.toId];
    while (queue.length > 0) {
      const parentId = queue.shift()!;
      for (const p of PANELS) {
        if (p.parentId === parentId) {
          panelIds.push(p.id);
          queue.push(p.id);
        }
      }
    }
    return panelIds;
  }

  /** Create spark burst at a cable endpoint */
  function createSparkBurst(position: Vector3): void {
    const spark = new ParticleSystem(`spark-${Date.now()}`, 50, scene);
    spark.particleTexture = new Texture(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACsIHo8AAACPklEQVRYCe1Wu0oDQRS9u5tNo0YQFH+g2NhYiJ1/YGPlB2hhIdhZ+Q1+gmBhZWUhCIKlYCMICj7wiSBqNJvZuXNndjab3SSry12YnTv3nHNndmYXIH8REY0T0QYRTRFRRUTCsC+6GH8noi9JcCoIgssgCG54PP3f3xERTWaz2bV8Pr/KAiYnJ0VXVxd1d3fT6Ogotbe3U39/Pw0PD1Mmk6GTkxO6vb2l8/Nzurm5obe3N3p6eqLHx0d6fn4mf3h4oKurKzo7O6PLy0vy8MXFRW9tbU34aLVaJ3Z3d0+73W6n0+lcjouL82J+fl6MjIyI/v5+MTAwQENDQ9TX10d9fX00MDBAMjARFRIYjuXt7S3xGHt6eghkVCqVCn0rFov0/v5Ob29v9PLyQnd3d3R9fU1nZ2d0cXFBFxcX6p79vqOjg76C8pOTk4/4s7Ozh3y5ublJP5+enj7d2dk5wSJ/bm5ObGxsiN3dXbG3t+ePLS0t+eeBgQE/xuLj4uJisFAoBJVKRdRqNUGk6P7+XvD99vaWpKenp+ni4iIwG43GSbPZbBaLxWK5XC63tra2amtrS6yvrydbc3NzwdTUVDA+Ph6Mjo4GQ0NDwcDAQNDb2xv09PQE3d3dQVdXV9DR0RG0t7cHbW1tQUtLi8hms4Jvz2kq4z/xM6L8JJU5wWJ+4h/qfgR7+P8XOiGiu3Q6PY+2IqIlIlr+FfWfJHQvoK+J6J2vbeEuJqKYX/MU/4tBIqrHZ/FTFedE9EhEXzylPwBDcHRJUfyKnwAAAAASUVORK5CYII=",
      scene
    );

    spark.emitter = position.clone();
    spark.minLifeTime = 0.1;
    spark.maxLifeTime = 0.4;
    spark.minSize = 0.03;
    spark.maxSize = 0.1;
    spark.emitRate = 0; // Only manual bursts

    spark.color1 = new Color4(1, 1, 0.3, 1);
    spark.color2 = new Color4(1, 0.8, 0.2, 1);
    spark.colorDead = new Color4(1, 0.3, 0, 0);

    spark.minEmitPower = 2;
    spark.maxEmitPower = 5;
    spark.direction1 = new Vector3(-1, 1, -1);
    spark.direction2 = new Vector3(1, 3, 1);
    spark.gravity = new Vector3(0, -9.8, 0);

    spark.start();
    spark.manualEmitCount = 50;

    sparkSystems.push(spark);

    // Auto-dispose after 1 second
    setTimeout(() => {
      spark.stop();
      spark.dispose();
      const idx = sparkSystems.indexOf(spark);
      if (idx >= 0) sparkSystems.splice(idx, 1);
    }, 1000);
  }

  /** Set a single cable to disconnected visual state */
  function disconnectSingle(cableId: string, withSpark: boolean): void {
    const state = cableStates.get(cableId);
    if (!state || state.disconnected) return;

    const cable = cables.get(cableId);
    if (!cable) return;

    // Save original color if not already saved
    const mat = cable.material as StandardMaterial | null;
    if (mat) {
      state.originalColor = mat.diffuseColor.clone();
      mat.diffuseColor = new Color3(0.3, 0.3, 0.3);
      mat.alpha = 0.5;
    }

    state.disconnected = true;

    // Stop flow particles
    flowEffect.stopCableFlow(cableId);

    // Spark at disconnect point (last waypoint)
    if (withSpark) {
      const route = routes.find((r) => r.id === cableId);
      if (route && route.waypoints.length > 0) {
        const wp = route.waypoints[0]!;
        createSparkBurst(new Vector3(wp.x, wp.y, wp.z));
      }
    }

    // Gray out destination panel indicator
    const affectedPanelIds = getAffectedPanelIds(cableId);
    for (const panelId of affectedPanelIds) {
      const panelNode = panels.get(panelId);
      if (!panelNode) continue;
      panelNode.getChildMeshes(false).forEach((mesh) => {
        if (mesh.name.includes("indicator")) {
          const indicatorMat = mesh.material as StandardMaterial | null;
          if (indicatorMat) {
            indicatorMat.diffuseColor = new Color3(0.3, 0.3, 0.3);
            indicatorMat.emissiveColor = Color3.Black();
          }
        }
      });
    }
  }

  /** Reconnect a single cable */
  function reconnectSingle(cableId: string): void {
    const state = cableStates.get(cableId);
    if (!state || !state.disconnected) return;

    const cable = cables.get(cableId);
    if (!cable) return;

    const mat = cable.material as StandardMaterial | null;
    if (mat) {
      mat.diffuseColor = state.originalColor.clone();
      mat.alpha = 0.85;
    }

    state.disconnected = false;
    flowEffect.resumeCableFlow(cableId);
  }

  /** Disconnect cable + cascade to all downstream */
  function disconnect(cableId: string): void {
    disconnectSingle(cableId, true);

    // Cascade downstream
    const downstream = getDownstreamCables(cableId);
    for (const childId of downstream) {
      disconnectSingle(childId, false);
    }
  }

  /** Reconnect cable + cascade to all downstream */
  function reconnect(cableId: string): void {
    reconnectSingle(cableId);

    const downstream = getDownstreamCables(cableId);
    for (const childId of downstream) {
      reconnectSingle(childId);
    }
  }

  function isDisconnected(cableId: string): boolean {
    return cableStates.get(cableId)?.disconnected ?? false;
  }

  function dispose(): void {
    for (const spark of sparkSystems) {
      spark.dispose();
    }
    sparkSystems.length = 0;
    cableStates.clear();
  }

  return { disconnect, reconnect, isDisconnected, dispose };
}
