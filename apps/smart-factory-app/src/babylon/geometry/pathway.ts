import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { SceneContext, PathwayConfig } from "../types";

const PATHWAY_HEIGHT = 3.5;
const ROOF_ALPHA = 0.12;

/**
 * Build covered walkways between buildings.
 */
export function buildPathways(ctx: SceneContext, pathways: PathwayConfig[]): void {
  const { scene } = ctx;

  const floorMat = new StandardMaterial("pathway-floor-mat", scene);
  floorMat.diffuseColor = Color3.FromHexString("#2A2A32");
  floorMat.specularColor = Color3.Black();

  const roofMat = new StandardMaterial("pathway-roof-mat", scene);
  roofMat.diffuseColor = Color3.FromHexString("#2A3040");
  roofMat.specularColor = Color3.Black();
  roofMat.alpha = ROOF_ALPHA;

  const lineMat = Color3.FromHexString("#3A4A5A");

  for (const pw of pathways) {
    const dx = pw.end.x - pw.start.x;
    const dz = pw.end.z - pw.start.z;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);
    const cx = (pw.start.x + pw.end.x) / 2;
    const cz = (pw.start.z + pw.end.z) / 2;

    // Floor
    const floor = MeshBuilder.CreateGround(
      `${pw.id}-floor`,
      { width: pw.width, height: length },
      scene
    );
    floor.position.set(cx, 0.03, cz);
    floor.rotation.y = angle;
    floor.material = floorMat;
    floor.receiveShadows = true;

    // Roof
    const roof = MeshBuilder.CreateBox(
      `${pw.id}-roof`,
      { width: pw.width, height: 0.1, depth: length },
      scene
    );
    roof.position.set(cx, PATHWAY_HEIGHT, cz);
    roof.rotation.y = angle;
    roof.material = roofMat;

    // Edge lines
    const hw = pw.width / 2;
    for (const side of [-1, 1]) {
      const offsetX = side * hw * Math.cos(angle + Math.PI / 2);
      const offsetZ = side * hw * Math.sin(angle + Math.PI / 2);

      // Swapping sin/cos to align with atan2(dx,dz) convention
      const line = MeshBuilder.CreateLines(
        `${pw.id}-edge-${side}`,
        {
          points: [
            new Vector3(pw.start.x + offsetX, 0.05, pw.start.z + offsetZ),
            new Vector3(pw.end.x + offsetX, 0.05, pw.end.z + offsetZ),
          ],
        },
        scene
      );
      line.color = lineMat;
    }
  }
}
