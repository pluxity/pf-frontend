import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { SceneContext } from "../types";
import { CAMPUS } from "@/config/campus-layout.config";

/**
 * Build the 220x160m campus ground plane.
 */
export function buildCampusGround(ctx: SceneContext): void {
  const { scene } = ctx;

  const ground = MeshBuilder.CreateGround(
    "campus-ground",
    { width: CAMPUS.groundWidth, height: CAMPUS.groundDepth },
    scene
  );
  ground.receiveShadows = true;
  const groundMat = new StandardMaterial("campus-ground-mat", scene);
  groundMat.diffuseColor = Color3.FromHexString("#1E1E24");
  groundMat.specularColor = Color3.Black();
  ground.material = groundMat;
}
