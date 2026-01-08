import type { GLTFJson } from "../types";

export const parseGLTFBoundingBox = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let gltfJson: GLTFJson | undefined;

  // GLB 여부 확인
  const isGLB =
    uint8Array[0] === 0x67 &&
    uint8Array[1] === 0x6c &&
    uint8Array[2] === 0x54 &&
    uint8Array[3] === 0x46;
  if (isGLB) {
    const view = new DataView(arrayBuffer);
    const jsonChunkLength = view.getUint32(12, true);
    const jsonChunkType = view.getUint32(16, true);
    if (jsonChunkType === 0x4e4f534a) {
      gltfJson = JSON.parse(
        new TextDecoder().decode(uint8Array.slice(20, 20 + jsonChunkLength))
      ) as GLTFJson;
    }
  } else {
    gltfJson = JSON.parse(new TextDecoder().decode(uint8Array)) as GLTFJson;
  }

  if (!gltfJson?.meshes || !gltfJson.accessors) return null;

  let minX = Infinity,
    maxX = -Infinity;
  let minZ = Infinity,
    maxZ = -Infinity;

  const processNode = (nodeIndex: number, parentScale: [number, number, number]) => {
    const node = gltfJson.nodes?.[nodeIndex];
    if (!node) return;

    const nodeScale = node.scale || [1, 1, 1];
    const currentScale: [number, number, number] = [
      (parentScale[0] ?? 1) * (nodeScale[0] ?? 1),
      (parentScale[1] ?? 1) * (nodeScale[1] ?? 1),
      (parentScale[2] ?? 1) * (nodeScale[2] ?? 1),
    ];

    if (node.mesh !== undefined) {
      const mesh = gltfJson.meshes?.[node.mesh];
      mesh?.primitives?.forEach((primitive) => {
        const accessor = gltfJson.accessors?.[primitive.attributes.POSITION ?? -1];
        if (
          accessor?.min &&
          accessor?.max &&
          accessor.min.length >= 3 &&
          accessor.max.length >= 3
        ) {
          const scaledMinX = (accessor.min[0] ?? 0) * currentScale[0];
          const scaledMaxX = (accessor.max[0] ?? 0) * currentScale[0];
          const scaledMinZ = (accessor.min[2] ?? 0) * currentScale[2];
          const scaledMaxZ = (accessor.max[2] ?? 0) * currentScale[2];

          minX = Math.min(minX, scaledMinX, scaledMaxX);
          maxX = Math.max(maxX, scaledMinX, scaledMaxX);
          minZ = Math.min(minZ, scaledMinZ, scaledMaxZ);
          maxZ = Math.max(maxZ, scaledMinZ, scaledMaxZ);
        }
      });
    }

    node.children?.forEach((childIndex) => processNode(childIndex, currentScale));
  };

  if (gltfJson.scenes?.[0]?.nodes && gltfJson.nodes) {
    gltfJson.scenes[0].nodes.forEach((nodeIndex) => processNode(nodeIndex, [1, 1, 1]));
  } else {
    gltfJson.meshes.forEach((mesh) => {
      mesh.primitives?.forEach((primitive) => {
        const accessor = gltfJson.accessors?.[primitive.attributes.POSITION ?? -1];
        if (
          accessor?.min &&
          accessor?.max &&
          accessor.min.length >= 3 &&
          accessor.max.length >= 3
        ) {
          minX = Math.min(minX, accessor.min[0] ?? Infinity);
          maxX = Math.max(maxX, accessor.max[0] ?? -Infinity);
          minZ = Math.min(minZ, accessor.min[2] ?? Infinity);
          maxZ = Math.max(maxZ, accessor.max[2] ?? -Infinity);
        }
      });
    });
  }

  if (minX === Infinity || minZ === Infinity) return null;
  return { width: maxX - minX, depth: maxZ - minZ };
};
