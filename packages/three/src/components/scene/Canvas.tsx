import type { ReactNode, ComponentProps } from "react";
import { Canvas as R3FCanvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import { SceneLighting, type LightingPreset } from "./SceneLighting";
import { SceneGrid, type SceneGridProps } from "../debug/SceneGrid";

type R3FCanvasProps = ComponentProps<typeof R3FCanvas>;
type OrbitControlsProps = ComponentProps<typeof OrbitControls>;

// Re-export LightingPreset and SceneGridProps for convenience
export type { LightingPreset, SceneGridProps };

export interface CanvasProps extends Omit<R3FCanvasProps, "children"> {
  children: ReactNode;
  background?: string | null;
  lighting?: LightingPreset | false;
  grid?: boolean | SceneGridProps;
  controls?: boolean | Omit<OrbitControlsProps, "makeDefault">;
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
 *
 * // 카메라 컨트롤 커스터마이징
 * <Canvas controls={{ minDistance: 5, maxDistance: 50, enablePan: false }}>
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
  // THREE.Camera 인스턴스가 전달되면 그대로 사용, 아니면 기본값과 병합
  const cameraConfig = (
    camera && typeof camera === "object" && "isCamera" in camera
      ? camera
      : camera
        ? { ...defaultCamera, ...camera }
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
      {controls !== false && (
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={1}
          maxDistance={500}
          {...(typeof controls === "object" ? controls : {})}
        />
      )}

      {/* 사용자 children */}
      {children}
    </R3FCanvas>
  );
}
