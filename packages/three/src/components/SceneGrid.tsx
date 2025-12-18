import { Grid } from "@react-three/drei";

export interface SceneGridProps {
  /**
   * 그리드 크기
   * @default 100
   */
  size?: number;

  /**
   * 분할 수
   * @default 100
   */
  divisions?: number;

  /**
   * 그리드 색상
   * @default "#6b7280"
   */
  color?: string;

  /**
   * 섹션 색상
   * @default color와 동일
   */
  sectionColor?: string;
}

/**
 * SceneGrid 컴포넌트
 *
 * 바닥 그리드를 표시하는 헬퍼 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <SceneGrid />
 *
 * // 커스터마이징
 * <SceneGrid size={200} divisions={50} color="#ff0000" />
 * ```
 */
export function SceneGrid({
  size = 100,
  divisions = 100,
  color = "#6b7280",
  sectionColor,
}: SceneGridProps) {
  const cellSize = size / (divisions > 0 ? divisions : 1);

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
