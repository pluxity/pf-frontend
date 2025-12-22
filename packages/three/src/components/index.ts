// Scene components
export { Canvas, SceneLighting, CameraControls } from "./scene";
export type {
  CanvasProps,
  LightingPreset,
  SceneGridProps,
  SceneLightingProps,
  DirectionalLightConfig,
  CameraControlsProps,
} from "./scene";

// Model components
export { GLTFModel, FBXModel, FeatureRenderer } from "./model";
export type { GLTFModelProps, FBXModelProps } from "./model";

// Debug components
export { SceneGrid, Stats, MeshOutline, MeshInfo, MeshInfoCompact } from "./debug";
export type { StatsProps, MeshInfoProps } from "./debug";

// Overlay components
export { CSS2DOverlay } from "./overlay";
