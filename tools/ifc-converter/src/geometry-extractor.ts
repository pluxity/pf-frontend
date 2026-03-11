import type { IfcAPI, FlatMesh, PlacedGeometry } from "web-ifc";
import { classifyElement, type Discipline } from "./classifier.js";

export interface ExtractedMesh {
  expressID: number;
  discipline: Discipline;
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  color: { r: number; g: number; b: number; a: number };
  transform: number[]; // 4×4 column-major matrix (16 floats)
}

/**
 * Extract all geometry from an IFC model, grouped by discipline.
 *
 * Uses `StreamAllMeshes` to iterate over every element that has geometry.
 * For each element:
 *   1. Determine IFC type → classify into ARC / MEP / STR
 *   2. For each PlacedGeometry, extract vertex data (position + normal)
 *      and index data, along with the color and 4×4 transform.
 */
export function extractGeometry(
  ifcApi: IfcAPI,
  modelID: number,
  disciplines?: Set<Discipline>
): Map<Discipline, ExtractedMesh[]> {
  const result = new Map<Discipline, ExtractedMesh[]>([
    ["arc", []],
    ["mep", []],
    ["str", []],
  ]);

  ifcApi.StreamAllMeshes(modelID, (flatMesh: FlatMesh) => {
    const expressID = flatMesh.expressID;

    // Determine IFC type
    const entityType = ifcApi.GetLineType(modelID, expressID);
    const discipline = classifyElement(entityType);
    if (!discipline) return; // skip non-classifiable elements
    if (disciplines && !disciplines.has(discipline)) return; // skip filtered disciplines

    const geometries = flatMesh.geometries;

    for (let i = 0; i < geometries.size(); i++) {
      const placed: PlacedGeometry = geometries.get(i);
      const geomData = ifcApi.GetGeometry(modelID, placed.geometryExpressID);

      // Vertex data: interleaved [x, y, z, nx, ny, nz] per vertex
      const vertexArray = ifcApi.GetVertexArray(
        geomData.GetVertexData(),
        geomData.GetVertexDataSize()
      );

      // Index data
      const indexArray = ifcApi.GetIndexArray(geomData.GetIndexData(), geomData.GetIndexDataSize());

      const vertexCount = vertexArray.length / 6;
      const positions = new Float32Array(vertexCount * 3);
      const normals = new Float32Array(vertexCount * 3);

      // De-interleave: [x,y,z,nx,ny,nz] → separate position & normal arrays
      for (let v = 0; v < vertexCount; v++) {
        const src = v * 6;
        const dst = v * 3;
        positions[dst] = vertexArray[src]!;
        positions[dst + 1] = vertexArray[src + 1]!;
        positions[dst + 2] = vertexArray[src + 2]!;
        normals[dst] = vertexArray[src + 3]!;
        normals[dst + 1] = vertexArray[src + 4]!;
        normals[dst + 2] = vertexArray[src + 5]!;
      }

      // Transform: column-major 4×4 from PlacedGeometry
      const transform = Array.from(placed.flatTransformation);

      // Color from PlacedGeometry
      const color = {
        r: placed.color.x,
        g: placed.color.y,
        b: placed.color.z,
        a: placed.color.w,
      };

      const extracted: ExtractedMesh = {
        expressID,
        discipline,
        positions,
        normals,
        indices: new Uint32Array(indexArray),
        color,
        transform,
      };

      result.get(discipline)!.push(extracted);

      // Release geometry data to free WASM memory
      geomData.delete();
    }
  });

  return result;
}

/**
 * Count total triangles across all disciplines for logging.
 */
export function countTriangles(
  groups: Map<Discipline, ExtractedMesh[]>
): Record<Discipline, number> {
  const counts = {} as Record<Discipline, number>;
  for (const [disc, meshes] of groups) {
    counts[disc] = meshes.reduce((sum, m) => sum + m.indices.length / 3, 0);
  }
  return counts;
}
