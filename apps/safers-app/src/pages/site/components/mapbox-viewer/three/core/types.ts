import type * as THREE from "three";
import type { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import type { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import type { ModelTransform, FeaturePosition } from "../../types";

export interface AssetEntry {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
  scale: number;
  autoPlay: boolean;
}

export interface FeatureEntry {
  assetId: string;
  group: THREE.Group;
  mixer: THREE.AnimationMixer | null;
  position: FeaturePosition;
}

export interface SceneContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
  composer: EffectComposer;
  outlinePass: OutlinePass;
  raycaster: THREE.Raycaster;
  clock: THREE.Clock;
  modelGroup: THREE.Group | null;
  assets: Map<string, AssetEntry>;
  assetLoadPromises: Map<string, Promise<void>>;
  features: Map<string, FeatureEntry>;
  initialPositions: Map<string, FeaturePosition>;
  lastModelTransformMat: THREE.Matrix4 | null;
  lastCombinedMatrix: THREE.Matrix4 | null;
  getTransform: () => ModelTransform;
  requestRepaint: () => void;
}
