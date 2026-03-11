import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Scene } from "@babylonjs/core/scene";

/**
 * PBR-like preset using StandardMaterial (matching existing factory scene style).
 */
interface MaterialPreset {
  diffuseColor: string;
  specularColor: [number, number, number];
  alpha?: number;
  emissiveScale?: number;
}

// --- IFC type → Material preset mapping ---

const WALL_PRESETS: Record<string, MaterialPreset> = {
  default: { diffuseColor: "#B8B0A0", specularColor: [0.1, 0.1, 0.12] },
  exterior: { diffuseColor: "#C8C0B0", specularColor: [0.08, 0.08, 0.1] },
  interior: { diffuseColor: "#D0C8B8", specularColor: [0.1, 0.1, 0.12] },
};

const SLAB_PRESET: MaterialPreset = {
  diffuseColor: "#808078",
  specularColor: [0.05, 0.05, 0.05],
};

const ROOF_PRESET: MaterialPreset = {
  diffuseColor: "#606058",
  specularColor: [0.05, 0.05, 0.05],
};

const DOOR_PRESET: MaterialPreset = {
  diffuseColor: "#6A5A4A",
  specularColor: [0.15, 0.15, 0.15],
};

const WINDOW_PRESET: MaterialPreset = {
  diffuseColor: "#8ABBD8",
  specularColor: [0.5, 0.5, 0.5],
  alpha: 0.35,
};

const STAIR_PRESET: MaterialPreset = {
  diffuseColor: "#5A6068",
  specularColor: [0.1, 0.1, 0.1],
};

const RAILING_PRESET: MaterialPreset = {
  diffuseColor: "#7A8A9A",
  specularColor: [0.3, 0.3, 0.3],
};

const CURTAIN_WALL_PRESET: MaterialPreset = {
  diffuseColor: "#6A8AA8",
  specularColor: [0.4, 0.4, 0.4],
  alpha: 0.5,
};

const COLUMN_PRESET: MaterialPreset = {
  diffuseColor: "#9A9890",
  specularColor: [0.15, 0.15, 0.15],
};

const BEAM_PRESET: MaterialPreset = {
  diffuseColor: "#8A8880",
  specularColor: [0.2, 0.2, 0.2],
};

const FOOTING_PRESET: MaterialPreset = {
  diffuseColor: "#7A7870",
  specularColor: [0.05, 0.05, 0.05],
};

const PIPE_PRESET: MaterialPreset = {
  diffuseColor: "#5A8A6A",
  specularColor: [0.3, 0.3, 0.3],
};

const DUCT_PRESET: MaterialPreset = {
  diffuseColor: "#7A8A9A",
  specularColor: [0.35, 0.35, 0.35],
};

const CABLE_PRESET: MaterialPreset = {
  diffuseColor: "#4A4A5A",
  specularColor: [0.15, 0.15, 0.15],
};

const FLOW_TERMINAL_PRESET: MaterialPreset = {
  diffuseColor: "#8A8A94",
  specularColor: [0.2, 0.2, 0.2],
};

const AIR_TERMINAL_PRESET: MaterialPreset = {
  diffuseColor: "#9AA0A8",
  specularColor: [0.25, 0.25, 0.25],
};

const SANITARY_PRESET: MaterialPreset = {
  diffuseColor: "#E8E0D8",
  specularColor: [0.4, 0.4, 0.4],
};

const ENERGY_DEVICE_PRESET: MaterialPreset = {
  diffuseColor: "#4A5A6A",
  specularColor: [0.2, 0.2, 0.2],
};

const PLATE_PRESET: MaterialPreset = {
  diffuseColor: "#A0A098",
  specularColor: [0.1, 0.1, 0.1],
};

const COVERING_PRESET: MaterialPreset = {
  diffuseColor: "#C0B8A8",
  specularColor: [0.05, 0.05, 0.05],
};

const PROXY_PRESET: MaterialPreset = {
  diffuseColor: "#6A6A74",
  specularColor: [0.15, 0.15, 0.15],
};

const MEMBER_PRESET: MaterialPreset = {
  diffuseColor: "#7A8088",
  specularColor: [0.2, 0.2, 0.2],
};

const DEFAULT_PRESET: MaterialPreset = {
  diffuseColor: "#8A8A8A",
  specularColor: [0.1, 0.1, 0.1],
};

/**
 * Map IFC type name → material preset.
 * Keys are substrings matched case-insensitively against the IFC type name.
 */
const TYPE_PRESET_MAP: Array<[string, MaterialPreset]> = [
  // Architecture
  ["IfcWallStandardCase", WALL_PRESETS.default!],
  ["IfcWall", WALL_PRESETS.default!],
  ["IfcSlab", SLAB_PRESET],
  ["IfcRoof", ROOF_PRESET],
  ["IfcDoor", DOOR_PRESET],
  ["IfcWindow", WINDOW_PRESET],
  ["IfcStair", STAIR_PRESET],
  ["IfcRailing", RAILING_PRESET],
  ["IfcCurtainWall", CURTAIN_WALL_PRESET],
  ["IfcPlate", PLATE_PRESET],
  ["IfcCovering", COVERING_PRESET],
  ["IfcOpeningElement", { diffuseColor: "#000000", specularColor: [0, 0, 0], alpha: 0 }],

  // Structural
  ["IfcColumn", COLUMN_PRESET],
  ["IfcBeam", BEAM_PRESET],
  ["IfcFooting", FOOTING_PRESET],
  ["IfcPile", FOOTING_PRESET],
  ["IfcMember", MEMBER_PRESET],
  ["IfcBuildingElementProxy", PROXY_PRESET],

  // MEP - Piping
  ["IfcPipeSegment", PIPE_PRESET],
  ["IfcPipeFitting", PIPE_PRESET],
  // MEP - Ductwork
  ["IfcDuctSegment", DUCT_PRESET],
  ["IfcDuctFitting", DUCT_PRESET],
  // MEP - Cabling
  ["IfcCableSegment", CABLE_PRESET],
  ["IfcCableCarrierSegment", CABLE_PRESET],
  // MEP - Terminals & devices
  ["IfcAirTerminal", AIR_TERMINAL_PRESET],
  ["IfcSanitaryTerminal", SANITARY_PRESET],
  ["IfcFlowTerminal", FLOW_TERMINAL_PRESET],
  ["IfcEnergyConversionDevice", ENERGY_DEVICE_PRESET],
  ["IfcFlowMovingDevice", ENERGY_DEVICE_PRESET],
  ["IfcFlowStorageDevice", ENERGY_DEVICE_PRESET],
  ["IfcFlowController", ENERGY_DEVICE_PRESET],
  ["IfcFlowSegment", PIPE_PRESET],
  ["IfcFlowFitting", PIPE_PRESET],
  // Generic flow (some IFC exports use these)
  ["IfcDistributionElement", ENERGY_DEVICE_PRESET],
];

/**
 * Get the material preset for a given IFC type name.
 */
export function getPresetForType(ifcTypeName: string): MaterialPreset {
  for (const [key, preset] of TYPE_PRESET_MAP) {
    if (ifcTypeName === key) return preset;
  }
  // Fallback: partial match
  for (const [key, preset] of TYPE_PRESET_MAP) {
    if (ifcTypeName.includes(key.replace("Ifc", ""))) return preset;
  }
  return DEFAULT_PRESET;
}

// --- Material cache (reuse across meshes with same IFC type) ---

const materialCache = new Map<string, StandardMaterial>();

/**
 * Create or retrieve a cached StandardMaterial for a given IFC type.
 */
export function getOrCreateMaterial(scene: Scene, ifcTypeName: string): StandardMaterial {
  const cacheKey = `ifc-${ifcTypeName}`;

  const cached = materialCache.get(cacheKey);
  if (cached) return cached;

  const preset = getPresetForType(ifcTypeName);
  const mat = new StandardMaterial(cacheKey, scene);
  const diffuse = Color3.FromHexString(preset.diffuseColor);

  mat.diffuseColor = diffuse;
  mat.specularColor = new Color3(
    preset.specularColor[0],
    preset.specularColor[1],
    preset.specularColor[2]
  );

  if (preset.alpha !== undefined) {
    mat.alpha = preset.alpha;
  }

  if (preset.emissiveScale !== undefined) {
    mat.emissiveColor = diffuse.scale(preset.emissiveScale);
  }

  // All IFC geometry should render both sides
  mat.backFaceCulling = false;

  // Store base color for potential tinting later
  mat.metadata = { baseColor: diffuse.clone() };

  materialCache.set(cacheKey, mat);
  return mat;
}

/**
 * Clear the material cache (call on scene dispose).
 */
export function clearMaterialCache(): void {
  materialCache.clear();
}
