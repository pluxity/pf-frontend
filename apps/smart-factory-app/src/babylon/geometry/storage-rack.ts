import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { SceneContext, StorageRackConfig } from "../types";

export function buildStorageRacks(
  ctx: SceneContext,
  racks: StorageRackConfig[],
  parent: TransformNode,
  prefix: string
): void {
  const { scene, shadowGenerator } = ctx;

  const frameMat = new StandardMaterial(`${prefix}-rack-frame-mat`, scene);
  frameMat.diffuseColor = Color3.FromHexString("#5A6A7A");
  frameMat.specularColor = new Color3(0.2, 0.2, 0.2);

  const shelfMat = new StandardMaterial(`${prefix}-rack-shelf-mat`, scene);
  shelfMat.diffuseColor = Color3.FromHexString("#4A5A6A");
  shelfMat.specularColor = new Color3(0.1, 0.1, 0.1);

  const rackWidth = 4;
  const rackDepth = 1.2;
  const rackHeight = 4;
  const shelfCount = 4;

  for (const rack of racks) {
    // 4 vertical posts
    for (const [ox, oz] of [
      [-rackWidth / 2 + 0.1, -rackDepth / 2 + 0.1],
      [rackWidth / 2 - 0.1, -rackDepth / 2 + 0.1],
      [-rackWidth / 2 + 0.1, rackDepth / 2 - 0.1],
      [rackWidth / 2 - 0.1, rackDepth / 2 - 0.1],
    ] as const) {
      const post = MeshBuilder.CreateBox(
        `${prefix}-rack-post-${rack.x}-${ox}-${oz}`,
        { width: 0.1, height: rackHeight, depth: 0.1 },
        scene
      );
      post.position.set(rack.x + ox, rackHeight / 2, rack.z + oz);
      post.rotation.y = rack.rotation;
      post.material = frameMat;
      post.receiveShadows = true;
      post.parent = parent;
      shadowGenerator.addShadowCaster(post);
    }

    // Horizontal shelves
    for (let si = 0; si < shelfCount; si++) {
      const sy = ((si + 1) / shelfCount) * rackHeight;
      const shelf = MeshBuilder.CreateBox(
        `${prefix}-rack-shelf-${rack.x}-${si}`,
        { width: rackWidth, height: 0.08, depth: rackDepth },
        scene
      );
      shelf.position.set(rack.x, sy, rack.z);
      shelf.rotation.y = rack.rotation;
      shelf.material = shelfMat;
      shelf.receiveShadows = true;
      shelf.parent = parent;
      shadowGenerator.addShadowCaster(shelf);
    }

    // A few boxes on shelves
    const boxMat = new StandardMaterial(`${prefix}-box-mat-${rack.x}`, scene);
    boxMat.diffuseColor = Color3.FromHexString("#7A6A5A");
    boxMat.specularColor = Color3.Black();

    for (let si = 0; si < shelfCount - 1; si++) {
      const sy = ((si + 1) / shelfCount) * rackHeight + 0.2;
      const boxCount = 2 + Math.floor(Math.random() * 2);
      for (let bi = 0; bi < boxCount; bi++) {
        const bx = rack.x + (bi - boxCount / 2 + 0.5) * 1.2;
        const box = MeshBuilder.CreateBox(
          `${prefix}-rack-box-${rack.x}-${si}-${bi}`,
          { width: 0.8, height: 0.35, depth: 0.8 },
          scene
        );
        box.position.set(bx, sy, rack.z);
        box.material = boxMat;
        box.parent = parent;
        shadowGenerator.addShadowCaster(box);
      }
    }
  }
}
