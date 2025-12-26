// Scene components
export { Canvas, SceneLighting } from "./scene";
export type {
  CanvasProps,
  LightingPreset,
  SceneLightingProps,
  DirectionalLightConfig,
} from "./scene";

// Model components
export { GLTFModel, FBXModel, FeatureRenderer } from "./model";
export type { GLTFModelProps, FBXModelProps } from "./model";

// Debug components
export { SceneGrid, Stats, MeshOutline, MeshInfo, MeshInfoCompact } from "./debug";
export type { StatsProps, MeshInfoProps, SceneGridProps } from "./debug";

// Overlay components
export { CSS2DOverlay } from "./overlay";
