import type { ReactNode } from "react";
import type { Vector3 } from "three";

export type OverlayPosition = Vector3 | [number, number, number];

export interface CSS2DOverlayProps {
  position: OverlayPosition;
  children: ReactNode;
  className?: string;
}
