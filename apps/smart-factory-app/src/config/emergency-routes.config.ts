import type { BuildingId } from "@/babylon/types";

export interface EmergencyRouteConfig {
  id: string;
  label: string;
  fromBuildingId: BuildingId;
  waypoints: { x: number; y: number; z: number }[];
  color: string;
  priority: "primary" | "secondary";
}

/**
 * Emergency evacuation routes: 2F → staircase → 1F → building exit → assembly point.
 * Coordinates reference campus-layout.config.ts building positions.
 *
 * Building positions & floorHeights:
 *   main-factory: pos(-40, -30), floorHeight=7, staircase at local(27, 17), rot=0
 *   warehouse:    pos(50, -32.5), floorHeight=6, staircase at local(19, -14), rot=PI
 *   utility:      pos(-40, 45),   floorHeight=5, staircase at local(12, -7),  rot=0
 *   quality-lab:  pos(50, 42.5),  floorHeight=6, staircase at local(14, -9),  rot=0
 *
 * Staircase U-turn structure (rotation=0):
 *   Upper flight: X ≈ +0.7 (right side), Z ascends from ~-depth*0.45 to ~+depth*0.45
 *   Landing: Y = floorHeight/2, Z ≈ +depth*0.5
 *   Lower flight: X ≈ -0.7 (left side), Z descends from ~+depth*0.45 to ~-depth*0.45
 *
 * For rotation=PI (warehouse): local X/Z axes are flipped.
 */
export const EMERGENCY_ROUTES: EmergencyRouteConfig[] = [
  // ── 본관 2F → 계단 → 1F → 정문 집결지 ──
  // Stair world center: (-13, -13), floorH=7, depth=5, width=3
  {
    id: "route-main-gate",
    label: "본관 2F → 정문 대피로",
    fromBuildingId: "main-factory",
    waypoints: [
      // 2F 검사구역 시작
      { x: -28, y: 7.3, z: -20 },
      // 2F 통로 → 계단 입구 (upper flight top, right side)
      { x: -12.2, y: 7.0, z: -14.5 },
      // Upper flight 하강 중간
      { x: -12.2, y: 5.5, z: -12.0 },
      // Upper flight → 랜딩 접근
      { x: -12.2, y: 4.0, z: -10.8 },
      // 랜딩 (U-turn: X shifts to left side)
      { x: -13.8, y: 3.5, z: -10.5 },
      // Lower flight 하강 시작
      { x: -13.8, y: 2.5, z: -11.5 },
      // Lower flight 하강 중간
      { x: -13.8, y: 1.2, z: -13.5 },
      // Lower flight 하부 도착 (1F)
      { x: -13.8, y: 0.3, z: -15.0 },
      // 1F → 남쪽 출구 방향
      { x: -13, y: 0.3, z: -30 },
      // 건물 남쪽 출구
      { x: -40, y: 0.3, z: -50 },
      // 외부 경유
      { x: -40, y: 0.3, z: -60 },
      // 동쪽으로 이동
      { x: -10, y: 0.3, z: -60 },
      // 정문 집결지
      { x: 0, y: 0.3, z: -80 },
    ],
    color: "#FF4444",
    priority: "primary",
  },

  // ── 물류동 2F → 계단 → 1F → 정문 집결지 ──
  // Stair world center: (69, -46.5), floorH=6, depth=5, width=3, rot=PI
  // PI rotation flips: local(+x,+z) → world(-x,-z) from stair center
  // Upper flight: world X = 69-0.7 = 68.3, Z from -46.5+2.25 = -44.25 to -46.5-2.25 = -48.75
  // Landing: world Z = -46.5-2.5 = -49.0, Y=3.0
  // Lower flight: world X = 69+0.7 = 69.7, Z from -48.75 to -44.25
  {
    id: "route-warehouse-gate",
    label: "물류동 2F → 정문 대피로",
    fromBuildingId: "warehouse",
    waypoints: [
      // 2F 적치구역 시작
      { x: 55, y: 6.3, z: -28 },
      // 2F → 계단 입구 (upper flight top, rot=PI so right→left side)
      { x: 68.3, y: 6.0, z: -45.0 },
      // Upper flight 하강 중간
      { x: 68.3, y: 4.8, z: -47.0 },
      // Upper flight → 랜딩 접근
      { x: 68.3, y: 3.6, z: -48.5 },
      // 랜딩 (U-turn: X shifts)
      { x: 69.7, y: 3.0, z: -49.0 },
      // Lower flight 하강 시작
      { x: 69.7, y: 2.0, z: -47.5 },
      // Lower flight 하강 중간
      { x: 69.7, y: 1.0, z: -45.5 },
      // Lower flight 하부 도착 (1F)
      { x: 69.7, y: 0.3, z: -44.0 },
      // 1F → 남쪽 출구
      { x: 69, y: 0.3, z: -52 },
      // 건물 밖
      { x: 50, y: 0.3, z: -55 },
      // 중간
      { x: 50, y: 0.3, z: -60 },
      // 서쪽으로 이동
      { x: 20, y: 0.3, z: -65 },
      // 정문 집결지
      { x: 0, y: 0.3, z: -80 },
    ],
    color: "#FF6644",
    priority: "primary",
  },

  // ── 품질동 2F → 계단 → 1F → 동쪽 비상구 ──
  // Stair world center: (64, 33.5), floorH=6, depth=4, width=2.5, rot=0
  // Upper flight: X = 64+0.6 = 64.6, Z from 33.5-1.8=31.7 to 33.5+1.8=35.3
  // Landing: Z = 33.5+2.0 = 35.5, Y=3.0
  // Lower flight: X = 64-0.6 = 63.4, Z from 35.3 to 31.7
  {
    id: "route-quality-gate",
    label: "품질동 2F → 동쪽 비상구",
    fromBuildingId: "quality-lab",
    waypoints: [
      // 2F 분석실 시작
      { x: 56, y: 6.3, z: 39 },
      // 2F → 계단 입구 (upper flight top)
      { x: 64.6, y: 6.0, z: 32.0 },
      // Upper flight 하강 중간
      { x: 64.6, y: 4.8, z: 33.5 },
      // Upper flight → 랜딩 접근
      { x: 64.6, y: 3.6, z: 35.0 },
      // 랜딩 (U-turn)
      { x: 63.4, y: 3.0, z: 35.5 },
      // Lower flight 하강 시작
      { x: 63.4, y: 2.0, z: 34.0 },
      // Lower flight 하강 중간
      { x: 63.4, y: 1.0, z: 32.5 },
      // Lower flight 하부 도착 (1F)
      { x: 63.4, y: 0.3, z: 31.5 },
      // 1F → 동쪽 출구
      { x: 68, y: 0.3, z: 42.5 },
      // 외부 동쪽
      { x: 80, y: 0.3, z: 42.5 },
      // 비상구 방향
      { x: 90, y: 0.3, z: 30 },
      // 동쪽 비상구 집결지
      { x: 95, y: 0.3, z: 20 },
    ],
    color: "#FF8844",
    priority: "secondary",
  },

  // ── 유틸리티동 2F → 계단 → 1F → 서쪽 비상구 ──
  // Stair world center: (-28, 38), floorH=5, depth=4, width=2.5, rot=0
  // Upper flight: X = -28+0.6 = -27.4, Z from 38-1.8=36.2 to 38+1.8=39.8
  // Landing: Z = 38+2.0 = 40.0, Y=2.5
  // Lower flight: X = -28-0.6 = -28.6, Z from 39.8 to 36.2
  {
    id: "route-utility-gate",
    label: "유틸리티동 2F → 서쪽 비상구",
    fromBuildingId: "utility",
    waypoints: [
      // 2F 기계실 시작
      { x: -34, y: 5.3, z: 44 },
      // 2F → 계단 입구 (upper flight top)
      { x: -27.4, y: 5.0, z: 36.5 },
      // Upper flight 하강 중간
      { x: -27.4, y: 3.8, z: 38.0 },
      // Upper flight → 랜딩 접근
      { x: -27.4, y: 3.0, z: 39.5 },
      // 랜딩 (U-turn)
      { x: -28.6, y: 2.5, z: 40.0 },
      // Lower flight 하강 시작
      { x: -28.6, y: 1.8, z: 38.5 },
      // Lower flight 하강 중간
      { x: -28.6, y: 1.0, z: 37.0 },
      // Lower flight 하부 도착 (1F)
      { x: -28.6, y: 0.3, z: 36.0 },
      // 1F → 서쪽 출구 방향
      { x: -40, y: 0.3, z: 42 },
      // 건물 서쪽 출구
      { x: -55, y: 0.3, z: 45 },
      // 서쪽으로
      { x: -70, y: 0.3, z: 45 },
      // 비상구 방향
      { x: -80, y: 0.3, z: 35 },
      // 서쪽 비상구 집결지
      { x: -90, y: 0.3, z: 25 },
    ],
    color: "#FF8844",
    priority: "secondary",
  },
];
