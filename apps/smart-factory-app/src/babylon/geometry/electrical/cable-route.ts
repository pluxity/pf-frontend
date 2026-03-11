import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { CableRouteConfig, LoadLevel } from "../../types";
import { LOAD_COLORS } from "@/config/campus-layout.config";

const CABLE_RADIUS_HV = 0.12;
const CABLE_RADIUS_LV = 0.06;

/**
 * Build a tube mesh along cable waypoints.
 * Returns the mesh so it can be toggled/colored later.
 */
export function buildCableRoute(scene: Scene, config: CableRouteConfig): Mesh {
  const path = config.waypoints.map((wp) => new Vector3(wp.x, wp.y, wp.z));
  const radius = config.voltage === "HV" ? CABLE_RADIUS_HV : CABLE_RADIUS_LV;

  const tube = MeshBuilder.CreateTube(
    `cable-${config.id}`,
    {
      path,
      radius,
      tessellation: 8,
      updatable: false,
    },
    scene
  );

  const mat = new StandardMaterial(`cable-mat-${config.id}`, scene);
  mat.diffuseColor = Color3.FromHexString(LOAD_COLORS.normal);
  mat.specularColor = new Color3(0.3, 0.3, 0.3);
  mat.alpha = 0.85;
  tube.material = mat;
  tube.metadata = { cableId: config.id };

  return tube;
}

/** Update cable color based on load level */
export function updateCableColor(mesh: Mesh, level: LoadLevel): void {
  const mat = mesh.material as StandardMaterial | null;
  if (!mat) return;
  mat.diffuseColor = Color3.FromHexString(LOAD_COLORS[level]);
}
