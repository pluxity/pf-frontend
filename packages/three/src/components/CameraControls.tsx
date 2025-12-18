import type { ComponentProps } from "react";
import { OrbitControls } from "@react-three/drei";

type OrbitControlsProps = ComponentProps<typeof OrbitControls>;

export interface CameraControlsProps extends Omit<OrbitControlsProps, "makeDefault"> {
  /**
   * 부드러운 움직임 활성화
   * @default true
   */
  enableDamping?: boolean;

  /**
   * 감쇠 계수 (dampingFactor)
   * @default 0.05
   */
  dampingFactor?: number;

  /**
   * 최소 거리
   * @default 1
   */
  minDistance?: number;

  /**
   * 최대 거리
   * @default 100
   */
  maxDistance?: number;

  /**
   * 패닝 활성화
   * @default true
   */
  enablePan?: boolean;

  /**
   * 줌 활성화
   * @default true
   */
  enableZoom?: boolean;

  /**
   * 회전 활성화
   * @default true
   */
  enableRotate?: boolean;
}

/**
 * CameraControls 컴포넌트
 *
 * @react-three/drei의 OrbitControls를 래핑하여 합리적인 기본값과 간소화된 API를 제공합니다.
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <Canvas>
 *   <GLTFModel url="/model.glb" />
 *   <CameraControls />
 * </Canvas>
 *
 * // 커스터마이징
 * <CameraControls
 *   minDistance={5}
 *   maxDistance={50}
 *   enablePan={false}
 * />
 * ```
 */
export function CameraControls({
  enableDamping = true,
  dampingFactor = 0.05,
  minDistance = 1,
  maxDistance = 100,
  enablePan = true,
  enableZoom = true,
  enableRotate = true,
  ...props
}: CameraControlsProps) {
  return (
    <OrbitControls
      makeDefault
      enableDamping={enableDamping}
      dampingFactor={dampingFactor}
      minDistance={minDistance}
      maxDistance={maxDistance}
      enablePan={enablePan}
      enableZoom={enableZoom}
      enableRotate={enableRotate}
      {...props}
    />
  );
}
