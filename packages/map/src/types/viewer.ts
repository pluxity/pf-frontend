import type { ReactNode } from "react";

export interface MapViewerProps {
  children?: ReactNode;
  className?: string;
  ionToken?: string;
  /**
   * Cesium requestRenderMode (default: false = 실시간 렌더)
   * true 로 두면 움직임/명령이 있을 때만 렌더되어 성능이 줄지만, 애니메이션은 직접 requestRender 호출 필요
   */
  requestRenderMode?: boolean;
  /**
   * requestRenderMode=true 일 때 프레임 간 최대 시간 (기본 Infinity)
   */
  maximumRenderTimeChange?: number;
}
