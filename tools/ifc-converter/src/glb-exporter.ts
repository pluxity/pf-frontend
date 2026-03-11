import { Document, NodeIO } from "@gltf-transform/core";
import { KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { draco } from "@gltf-transform/functions";
// @ts-expect-error — draco3dgltf has no type declarations
import draco3d from "draco3dgltf";
import type { ExtractedMesh } from "./geometry-extractor.js";

// --- Color key for grouping ---

function colorKey(c: { r: number; g: number; b: number; a: number }): string {
  // Quantise to 2 decimal places to merge near-identical colours
  return `${c.r.toFixed(2)}_${c.g.toFixed(2)}_${c.b.toFixed(2)}_${c.a.toFixed(2)}`;
}

// --- Transform positions & normals by a 4×4 column-major matrix ---

function applyTransform(
  positions: Float32Array,
  normals: Float32Array,
  matrix: number[]
): { positions: Float32Array; normals: Float32Array } {
  const m = matrix;
  const outPos = new Float32Array(positions.length);
  const outNor = new Float32Array(normals.length);

  const vertexCount = positions.length / 3;
  for (let i = 0; i < vertexCount; i++) {
    const px = positions[i * 3]!;
    const py = positions[i * 3 + 1]!;
    const pz = positions[i * 3 + 2]!;

    // Position: M * [x,y,z,1]  (column-major)
    outPos[i * 3] = m[0]! * px + m[4]! * py + m[8]! * pz + m[12]!;
    outPos[i * 3 + 1] = m[1]! * px + m[5]! * py + m[9]! * pz + m[13]!;
    outPos[i * 3 + 2] = m[2]! * px + m[6]! * py + m[10]! * pz + m[14]!;

    // Normal: upper-left 3×3 of M (no translation), then normalise
    const nx = normals[i * 3]!;
    const ny = normals[i * 3 + 1]!;
    const nz = normals[i * 3 + 2]!;

    let tnx = m[0]! * nx + m[4]! * ny + m[8]! * nz;
    let tny = m[1]! * nx + m[5]! * ny + m[9]! * nz;
    let tnz = m[2]! * nx + m[6]! * ny + m[10]! * nz;

    const len = Math.sqrt(tnx * tnx + tny * tny + tnz * tnz);
    if (len > 1e-6) {
      tnx /= len;
      tny /= len;
      tnz /= len;
    }

    outNor[i * 3] = tnx;
    outNor[i * 3 + 1] = tny;
    outNor[i * 3 + 2] = tnz;
  }

  return { positions: outPos, normals: outNor };
}

// --- Merge multiple meshes that share the same material ---

interface MergedGeometry {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  expressIDs: number[];
}

function mergeMeshes(meshes: ExtractedMesh[]): MergedGeometry {
  let totalVertices = 0;
  let totalIndices = 0;
  const expressIDs: number[] = [];

  for (const m of meshes) {
    totalVertices += m.positions.length / 3;
    totalIndices += m.indices.length;
    if (!expressIDs.includes(m.expressID)) {
      expressIDs.push(m.expressID);
    }
  }

  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const indices = new Uint32Array(totalIndices);

  let vertexOffset = 0;
  let indexOffset = 0;

  for (const m of meshes) {
    // Apply the element's placement transform to world space
    const transformed = applyTransform(m.positions, m.normals, m.transform);

    positions.set(transformed.positions, vertexOffset * 3);
    normals.set(transformed.normals, vertexOffset * 3);

    // Offset indices
    for (let i = 0; i < m.indices.length; i++) {
      indices[indexOffset + i] = m.indices[i]! + vertexOffset;
    }

    vertexOffset += m.positions.length / 3;
    indexOffset += m.indices.length;
  }

  return { positions, normals, indices, expressIDs };
}

// --- Helpers to create ArrayBuffer-backed typed arrays ---

function toArrayBufferFloat32(src: Float32Array): Float32Array<ArrayBuffer> {
  const buf = new ArrayBuffer(src.byteLength);
  const dst = new Float32Array(buf);
  dst.set(src);
  return dst;
}

function toArrayBufferUint32(src: Uint32Array): Uint32Array<ArrayBuffer> {
  const buf = new ArrayBuffer(src.byteLength);
  const dst = new Uint32Array(buf);
  dst.set(src);
  return dst;
}

// --- Main export function ---

export interface ExportOptions {
  useDraco?: boolean;
}

/**
 * Export a list of ExtractedMesh objects into a single GLB file.
 *
 * Meshes are grouped by color (material), merged, and written as
 * separate glTF nodes. Each node's `extras` stores the array of
 * IFC expressIDs so the Babylon.js loader can map mesh → metadata.
 */
export async function exportToGLB(
  meshes: ExtractedMesh[],
  outputPath: string,
  options: ExportOptions = {}
): Promise<{ vertexCount: number; nodeCount: number }> {
  if (meshes.length === 0) {
    throw new Error("No meshes to export");
  }

  const doc = new Document();
  const buffer = doc.createBuffer("main");
  const scene = doc.createScene("Scene");

  // Filter out fully transparent meshes (alpha ≈ 0, e.g. IfcOpeningElement voids)
  const visibleMeshes = meshes.filter((m) => m.color.a > 0.01);
  if (visibleMeshes.length === 0) {
    throw new Error("No visible meshes to export (all are fully transparent)");
  }

  // Group meshes by colour
  const groups = new Map<string, ExtractedMesh[]>();
  for (const m of visibleMeshes) {
    const key = colorKey(m.color);
    let arr = groups.get(key);
    if (!arr) {
      arr = [];
      groups.set(key, arr);
    }
    arr.push(m);
  }

  let totalVertices = 0;
  let nodeCount = 0;

  for (const [_key, group] of groups) {
    const first = group[0]!;
    const merged = mergeMeshes(group);

    // --- Material ---
    const material = doc
      .createMaterial()
      .setBaseColorFactor([first.color.r, first.color.g, first.color.b, first.color.a])
      .setRoughnessFactor(0.8)
      .setMetallicFactor(0.0);

    if (first.color.a < 1.0) {
      material.setAlphaMode("BLEND");
    }

    // --- Accessors (ensure ArrayBuffer-backed typed arrays) ---
    const posAccessor = doc
      .createAccessor()
      .setType("VEC3")
      .setArray(toArrayBufferFloat32(merged.positions))
      .setBuffer(buffer);

    const norAccessor = doc
      .createAccessor()
      .setType("VEC3")
      .setArray(toArrayBufferFloat32(merged.normals))
      .setBuffer(buffer);

    const idxAccessor = doc
      .createAccessor()
      .setType("SCALAR")
      .setArray(toArrayBufferUint32(merged.indices))
      .setBuffer(buffer);

    // --- Primitive → Mesh → Node ---
    const primitive = doc
      .createPrimitive()
      .setMode(4) // TRIANGLES
      .setAttribute("POSITION", posAccessor)
      .setAttribute("NORMAL", norAccessor)
      .setIndices(idxAccessor)
      .setMaterial(material);

    const mesh = doc.createMesh().addPrimitive(primitive);

    const node = doc.createNode().setMesh(mesh).setExtras({ expressIDs: merged.expressIDs });

    scene.addChild(node);

    totalVertices += merged.positions.length / 3;
    nodeCount++;
  }

  // --- Write GLB ---
  const io = new NodeIO();

  if (options.useDraco) {
    // Register Draco extension + encoder dependency on the IO instance

    const encoderModule = await draco3d.createEncoderModule();
    io.registerExtensions([KHRDracoMeshCompression]).registerDependencies({
      "draco3d.encoder": encoderModule,
    });

    await doc.transform(draco({ method: "edgebreaker", encodeSpeed: 5, decodeSpeed: 5 }));
  }

  await io.write(outputPath, doc);

  return { vertexCount: totalVertices, nodeCount };
}
