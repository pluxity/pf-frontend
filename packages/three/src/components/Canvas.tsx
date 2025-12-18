import type { ReactNode, ComponentProps } from "react";
import { Canvas as R3FCanvas } from "@react-three/fiber";
import { Grid } from "@react-three/drei";

import { SceneLighting, type LightingPreset } from "./SceneLighting";
import { CameraControls } from "./CameraControls";

type R3FCanvasProps = ComponentProps<typeof R3FCanvas>;

// Re-export LightingPreset for convenience
export type { LightingPreset };

export interface SceneGridProps {
  size?: number;
  divisions?: number;
  color?: string;
  sectionColor?: string;
}

export interface CanvasProps extends Omit<R3FCanvasProps, "children"> {
  children: ReactNode;
  background?: string | null;
  lighting?: LightingPreset | false;
  grid?: boolean | SceneGridProps;
  controls?: boolean;
}

/**
 * Canvas 컴포넌트
 *
 * @react-three/fiber의 Canvas를 래핑하여 합리적인 기본값과 간소화된 API를 제공합니다.
 *
 * @example
 * ```tsx
 * // 최소 사용
 * <Canvas>
 *   <GLTFModel url="/model.glb" />
 * </Canvas>
 *
 * // 커스터마이징
 * <Canvas lighting="studio" grid background="#000">
 *   <GLTFModel url="/model.glb" />
 * </Canvas>
 * ```
 */
export function Canvas({
  children,
  background = "#1a1a1a",
  lighting = "default",
  grid = false,
  controls = true,
  camera,
  ...props
}: CanvasProps) {
  // 그리드 props 파싱
  const gridProps: SceneGridProps | null = grid === false ? null : grid === true ? {} : grid;

  // 기본 카메라 설정 (사용자 설정과 병합)
  const defaultCamera = {
    position: [10, 10, 10] as [number, number, number],
    fov: 75,
  };
  const cameraConfig = (
    camera
      ? ({ ...defaultCamera, ...camera } as NonNullable<R3FCanvasProps["camera"]>)
      : defaultCamera
  ) as R3FCanvasProps["camera"];

  return (
    <R3FCanvas camera={cameraConfig} shadows {...props}>
      {/* 배경색 설정 */}
      {background && <color attach="background" args={[background]} />}

      {/* 조명 프리셋 */}
      {lighting !== false && <SceneLighting preset={lighting} />}

      {/* 그리드 */}
      {gridProps && <SceneGrid {...gridProps} />}

      {/* 카메라 컨트롤 */}
      {controls && <CameraControls />}

      {/* 사용자 children */}
      {children}
    </R3FCanvas>
  );
}

/**
 * 내부 그리드 컴포넌트
 */
function SceneGrid({
  size = 100,
  divisions = 100,
  color = "#6b7280",
  sectionColor,
}: SceneGridProps) {
  const cellSize = size / divisions;

  return (
    <Grid
      args={[size, size]}
      cellSize={cellSize}
      cellThickness={1}
      cellColor={color}
      sectionSize={size / 10}
      sectionThickness={1.5}
      sectionColor={sectionColor ?? color}
      fadeDistance={400}
      fadeStrength={1}
      followCamera={false}
      infiniteGrid={false}
      position={[0, -0.01, 0]}
    />
  );
}
