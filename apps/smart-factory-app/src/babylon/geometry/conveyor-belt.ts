import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { SceneContext, ConveyorConfig } from "../types";

export function buildConveyorBelt(
  ctx: SceneContext,
  conveyor: ConveyorConfig,
  parent: TransformNode,
  prefix: string
): void {
  const { scene, shadowGenerator } = ctx;

  const beltMat = new StandardMaterial(`${prefix}-belt-mat`, scene);
  beltMat.diffuseColor = Color3.FromHexString("#3A3A42");
  beltMat.specularColor = new Color3(0.1, 0.1, 0.1);

  const railMat = new StandardMaterial(`${prefix}-rail-mat`, scene);
  railMat.diffuseColor = Color3.FromHexString("#5A5A64");
  railMat.specularColor = new Color3(0.3, 0.3, 0.3);

  const rollerMat = new StandardMaterial(`${prefix}-roller-mat`, scene);
  rollerMat.diffuseColor = Color3.FromHexString("#6A6A74");
  rollerMat.specularColor = new Color3(0.4, 0.4, 0.4);

  for (let si = 0; si < conveyor.segments.length; si++) {
    const seg = conveyor.segments[si]!;
    const dx = seg.to.x - seg.from.x;
    const dz = seg.to.z - seg.from.z;
    const length = Math.sqrt(dx * dx + dz * dz);
    const angle = Math.atan2(dx, dz);

    const cx = (seg.from.x + seg.to.x) / 2;
    const cz = (seg.from.z + seg.to.z) / 2;

    // Belt surface
    const belt = MeshBuilder.CreateBox(
      `${prefix}-belt-${si}`,
      { width: conveyor.width, height: 0.05, depth: length },
      scene
    );
    belt.position.set(cx, conveyor.y, cz);
    belt.rotation.y = angle;
    belt.material = beltMat;
    belt.receiveShadows = true;
    belt.parent = parent;

    // Side rails
    for (const side of [-1, 1]) {
      const rail = MeshBuilder.CreateBox(
        `${prefix}-rail-${si}-${side}`,
        { width: 0.08, height: 0.2, depth: length },
        scene
      );
      const offset = new Vector3((side * conveyor.width) / 2, 0, 0);
      const rx = offset.x * Math.cos(angle) - offset.z * Math.sin(angle);
      const rz = offset.x * Math.sin(angle) + offset.z * Math.cos(angle);
      rail.position.set(cx + rx, conveyor.y + 0.1, cz + rz);
      rail.rotation.y = angle;
      rail.material = railMat;
      rail.parent = parent;
      shadowGenerator.addShadowCaster(rail);
    }

    // Legs
    const legCount = Math.max(2, Math.floor(length / 4));
    const legMat = new StandardMaterial(`${prefix}-leg-mat-${si}`, scene);
    legMat.diffuseColor = Color3.FromHexString("#4A4A54");
    legMat.specularColor = Color3.Black();

    for (let li = 0; li < legCount; li++) {
      const t = (li + 0.5) / legCount;
      const lx = seg.from.x + dx * t;
      const lz = seg.from.z + dz * t;

      for (const side of [-1, 1]) {
        const legOffsetX = side * (conveyor.width / 2 - 0.1);
        const rx = legOffsetX * Math.cos(angle);
        const rz = legOffsetX * Math.sin(angle);

        const leg = MeshBuilder.CreateCylinder(
          `${prefix}-leg-${si}-${li}-${side}`,
          { diameter: 0.1, height: conveyor.y, tessellation: 8 },
          scene
        );
        leg.position.set(lx + rx, conveyor.y / 2, lz + rz);
        leg.material = legMat;
        leg.parent = parent;
        shadowGenerator.addShadowCaster(leg);
      }
    }

    // Rollers
    const rollerCount = Math.floor(length / conveyor.rollerSpacing);
    for (let ri = 0; ri < rollerCount; ri++) {
      const t = (ri + 0.5) / rollerCount;
      const rx = seg.from.x + dx * t;
      const rz = seg.from.z + dz * t;

      const roller = MeshBuilder.CreateCylinder(
        `${prefix}-roller-${si}-${ri}`,
        { diameter: conveyor.rollerRadius * 2, height: conveyor.width - 0.1, tessellation: 8 },
        scene
      );
      roller.position.set(rx, conveyor.y + 0.03, rz);
      roller.rotation.z = Math.PI / 2;
      roller.rotation.y = angle;
      roller.material = rollerMat;
      roller.parent = parent;
    }
  }
}
