/**
 * @deprecated Use campus-layout.config.ts instead.
 * This file re-exports for backward compatibility.
 */
export { STATUS_COLORS } from "./campus-layout.config";

// Legacy FACTORY constant — no longer used by parameterized geometry.
// Kept only if any external code still references it.
export const FACTORY = {
  floor: { width: 60, depth: 40 },
  wallHeight: 8,
  wallThickness: 0.3,
  wallAlpha: 0.15,
  roofHeight: 0.2,
  pillarRadius: 0.3,
  pillarCount: { x: 4, z: 3 },
  zones: [
    { name: "가공 구역", x: -15, z: -8, w: 20, d: 18, color: "#1a2a3a" },
    { name: "조립 구역", x: 12, z: -8, w: 16, d: 18, color: "#1a2a2a" },
    { name: "검사 구역", x: 12, z: 10, w: 16, d: 10, color: "#2a1a2a" },
    { name: "자재 구역", x: -15, z: 12, w: 20, d: 8, color: "#1a1a2a" },
  ],
  conveyor: {
    y: 1.0,
    width: 1.5,
    rollerRadius: 0.15,
    rollerSpacing: 0.6,
    segments: [
      { from: { x: -24, z: 0 }, to: { x: 5, z: 0 } },
      { from: { x: 5, z: 0 }, to: { x: 5, z: -12 } },
      { from: { x: 5, z: -12 }, to: { x: 20, z: -12 } },
    ],
  },
  storageRacks: [
    { x: -20, z: 14, rotation: 0 },
    { x: -14, z: 14, rotation: 0 },
    { x: -8, z: 14, rotation: 0 },
  ],
} as const;
