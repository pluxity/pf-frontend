import { useMemo } from "react";

export type LightingPreset = "default" | "studio" | "outdoor";

export interface DirectionalLightConfig {
  position?: [number, number, number];
  intensity?: number;
  castShadow?: boolean;
}

export interface SceneLightingProps {
  /**
   * 조명 프리셋
   * - `default`: 일반적인 실내 조명
   * - `studio`: 스튜디오 조명 (다중 조명, 그림자)
   * - `outdoor`: 야외 조명 (강한 directional, 그림자)
   */
  preset?: LightingPreset;

  /**
   * Ambient 조명 강도 오버라이드
   */
  ambient?: number;

  /**
   * Directional 조명 설정 오버라이드
   */
  directional?: DirectionalLightConfig;
}

interface PresetConfig {
  ambient: number;
  lights: Array<{
    type: "directional";
    position: [number, number, number];
    intensity: number;
    castShadow: boolean;
  }>;
}

/**
 * 조명 프리셋 설정 상수
 */
const PRESET_CONFIGS: Record<LightingPreset, PresetConfig> = {
  studio: {
    ambient: 0.4,
    lights: [
      {
        type: "directional",
        position: [10, 10, 5],
        intensity: 1,
        castShadow: true,
      },
      {
        type: "directional",
        position: [-10, -10, -5],
        intensity: 0.5,
        castShadow: false,
      },
    ],
  },
  outdoor: {
    ambient: 0.6,
    lights: [
      {
        type: "directional",
        position: [10, 10, 5],
        intensity: 2,
        castShadow: true,
      },
    ],
  },
  default: {
    ambient: 0.5,
    lights: [
      {
        type: "directional",
        position: [10, 10, 5],
        intensity: 1,
        castShadow: false,
      },
    ],
  },
};

/**
 * SceneLighting 컴포넌트
 *
 * 씬 조명을 설정하는 컴포넌트입니다. 프리셋 시스템과 세밀한 커스터마이징을 모두 지원합니다.
 *
 * @example
 * ```tsx
 * // 프리셋 사용
 * <SceneLighting preset="studio" />
 *
 * // 커스터마이징
 * <SceneLighting
 *   preset="default"
 *   ambient={0.3}
 *   directional={{ intensity: 2, castShadow: true }}
 * />
 * ```
 */
export function SceneLighting({ preset = "default", ambient, directional }: SceneLightingProps) {
  const { ambientIntensity, lights } = useMemo(() => {
    const presetConfig = getPresetConfig(preset);

    // Ambient 조명 강도 (오버라이드 또는 프리셋 값)
    const finalAmbientIntensity = ambient ?? presetConfig.ambient;

    // Directional 조명 설정 (첫 번째 조명에만 오버라이드 적용)
    const finalLights = presetConfig.lights.map((light, index) => {
      if (index === 0 && directional) {
        return {
          ...light,
          position: directional.position ?? light.position,
          intensity: directional.intensity ?? light.intensity,
          castShadow: directional.castShadow ?? light.castShadow,
        };
      }
      return light;
    });

    return { ambientIntensity: finalAmbientIntensity, lights: finalLights };
  }, [preset, ambient, directional]);

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      {lights.map((light, index) => (
        <directionalLight
          key={index}
          position={light.position}
          intensity={light.intensity}
          castShadow={light.castShadow}
        />
      ))}
    </>
  );
}

/**
 * 조명 프리셋 설정 반환
 */
function getPresetConfig(preset: LightingPreset): PresetConfig {
  return PRESET_CONFIGS[preset];
}
