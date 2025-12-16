// Traverse
export {
  traverseModel,
  traverseMeshes,
  filterMeshes,
  findMeshByName,
  findMeshesByName,
} from "./traverse.ts";

// Dispose
export {
  disposeMesh,
  disposeScene,
  disposeMeshes,
  disposeMaterial,
  disposeGeometry,
} from "./dispose.ts";

// Geometry
export { getMeshInfo, computeBoundingBox, getCenterPoint, getSize } from "./geometry.ts";

// Materials
export {
  cloneMaterial,
  updateMaterialProps,
  setMaterialColor,
  setMaterialOpacity,
  getAllMaterials,
} from "./materials.ts";

// Types
export type { TraverseCallback, MeshCallback, MeshPredicate, MeshInfo } from "./types.ts";
