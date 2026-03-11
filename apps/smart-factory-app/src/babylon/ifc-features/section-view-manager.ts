import { Plane } from "@babylonjs/core/Maths/math.plane";
import type { Scene } from "@babylonjs/core/scene";
import type { SectionAxis } from "../types";

/**
 * Section view manager using Babylon.js ClipPlane.
 * Enables clipping the scene along X, Y, or Z axis.
 */
export function createSectionViewManager(scene: Scene) {
  let currentAxis: SectionAxis | null = null;
  let currentPosition = 0;

  function getNormal(axis: SectionAxis): { x: number; y: number; z: number } {
    switch (axis) {
      case "x":
        return { x: -1, y: 0, z: 0 };
      case "y":
        return { x: 0, y: -1, z: 0 };
      case "z":
        return { x: 0, y: 0, z: -1 };
    }
  }

  function enableSection(axis: SectionAxis, position: number): void {
    currentAxis = axis;
    currentPosition = position;
    const normal = getNormal(axis);
    scene.clipPlane = new Plane(normal.x, normal.y, normal.z, position);
  }

  function setPosition(position: number): void {
    if (!currentAxis) return;
    currentPosition = position;
    const normal = getNormal(currentAxis);
    scene.clipPlane = new Plane(normal.x, normal.y, normal.z, position);
  }

  function disableSection(): void {
    currentAxis = null;
    currentPosition = 0;
    scene.clipPlane = null;
  }

  function getAxis(): SectionAxis | null {
    return currentAxis;
  }

  function getPosition(): number {
    return currentPosition;
  }

  function isEnabled(): boolean {
    return currentAxis !== null;
  }

  function dispose(): void {
    disableSection();
  }

  return {
    enableSection,
    setPosition,
    disableSection,
    getAxis,
    getPosition,
    isEnabled,
    dispose,
  };
}
