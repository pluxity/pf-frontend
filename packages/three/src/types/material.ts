export interface MaterialPreset {
  color?: string | number;
  roughness?: number;
  metalness?: number;
  envMapIntensity?: number;
  transparent?: boolean;
  opacity?: number;
  side?: number;
  depthWrite?: boolean;
  emissive?: string | number;
  emissiveIntensity?: number;
}

export interface MaterialPresetRule {
  pattern: RegExp | string;
  preset: MaterialPreset;
}

export interface MaterialPresetsConfig {
  rules: MaterialPresetRule[];
  default?: MaterialPreset;
}
