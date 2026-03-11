import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { IFCModelResult } from "./ifc-model-loader";
import type { IFCIndices, StoreyInfo, SpatialNode } from "../types";

/**
 * Build lookup indices from loaded IFC models.
 * Creates maps for storey→meshes, type→meshes, and expressID→mesh.
 */
export function buildIFCIndices(models: IFCModelResult[]): IFCIndices {
  const storeyMeshes = new Map<number, AbstractMesh[]>();
  const typeMeshes = new Map<string, AbstractMesh[]>();
  const expressIdToMesh = new Map<number, AbstractMesh>();
  const storeys: StoreyInfo[] = [];

  // Collect storey info from spatial hierarchy
  const storeyCountMap = new Map<number, number>();

  for (const model of models) {
    // Walk spatial hierarchy to find storeys
    for (const rootNode of model.metadata.spatialHierarchy) {
      walkSpatialTree(rootNode, (node) => {
        if (node.type === "IfcBuildingStorey" || node.type.includes("Storey")) {
          if (!storeyCountMap.has(node.expressID)) {
            storeyCountMap.set(node.expressID, 0);
          }
        }
      });
    }

    // Index all meshes by expressID → element metadata
    for (const mesh of model.meshes) {
      const expressIDs = model.getMeshExpressIDs(mesh);
      if (expressIDs.length === 0) continue;

      for (const eid of expressIDs) {
        // First mesh wins for expressID lookup
        if (!expressIdToMesh.has(eid)) {
          expressIdToMesh.set(eid, mesh);
        }

        const element = model.getElementByExpressID(eid);
        if (!element) continue;

        // Group by storey
        if (element.storeyId != null) {
          let arr = storeyMeshes.get(element.storeyId);
          if (!arr) {
            arr = [];
            storeyMeshes.set(element.storeyId, arr);
          }
          // Avoid duplicate mesh entries per storey
          if (!arr.includes(mesh)) {
            arr.push(mesh);
          }
          storeyCountMap.set(element.storeyId, (storeyCountMap.get(element.storeyId) ?? 0) + 1);
        }

        // Group by IFC type
        let typeArr = typeMeshes.get(element.type);
        if (!typeArr) {
          typeArr = [];
          typeMeshes.set(element.type, typeArr);
        }
        if (!typeArr.includes(mesh)) {
          typeArr.push(mesh);
        }
      }
    }
  }

  // Build storey info list
  for (const model of models) {
    for (const rootNode of model.metadata.spatialHierarchy) {
      walkSpatialTree(rootNode, (node) => {
        if (
          (node.type === "IfcBuildingStorey" || node.type.includes("Storey")) &&
          storeyCountMap.has(node.expressID)
        ) {
          // Avoid duplicates in storeys array
          if (!storeys.some((s) => s.expressID === node.expressID)) {
            // Extract elevation from element properties if available
            const element = model.getElementByExpressID(node.expressID);
            const elevProp = element?.properties["Elevation"];
            const elevation = typeof elevProp === "number" ? elevProp : 0;

            storeys.push({
              expressID: node.expressID,
              name: node.name || `Storey ${node.expressID}`,
              elevation,
              meshCount: storeyCountMap.get(node.expressID) ?? 0,
            });
          }
        }
      });
    }
  }

  // Sort storeys by elevation
  storeys.sort((a, b) => a.elevation - b.elevation);

  return { storeyMeshes, typeMeshes, expressIdToMesh, storeys };
}

function walkSpatialTree(node: SpatialNode, visitor: (node: SpatialNode) => void): void {
  visitor(node);
  for (const child of node.children) {
    walkSpatialTree(child, visitor);
  }
}
