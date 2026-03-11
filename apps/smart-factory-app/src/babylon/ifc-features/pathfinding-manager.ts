import { RecastJSPlugin } from "@babylonjs/core/Navigation/Plugins/recastJSPlugin";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexData } from "@babylonjs/core/Meshes/mesh.vertexData";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { INavMeshParameters } from "@babylonjs/core/Navigation/INavigationEngine";

import "@babylonjs/core/Navigation/Plugins/recastJSPlugin";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const WALKABLE_KEYWORDS = [
  "floor",
  "slab",
  "corridor",
  "hallway",
  "stair",
  "ground",
  "ramp",
  "landing",
  "walkway",
  "pavement",
  "deck",
  "platform",
];

const OBSTACLE_EXCLUDE_SUFFIXES = ["_dr", "_wd"];
const WALKABLE_SUFFIXES = ["_fl", "_st", "_ev"];
const FLOOR_PREFIX_RE = /^(\d+F|B\d+|RF)_/i;
const STAIR_SUFFIX = "_st";
const EV_SUFFIX = "_ev";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasSegment(name: string, suffix: string): boolean {
  const idx = name.indexOf(suffix);
  if (idx < 0) return false;
  const afterIdx = idx + suffix.length;
  return afterIdx === name.length || name[afterIdx] === "_";
}

function extractFloor(meshName: string): string | null {
  const match = meshName.match(FLOOR_PREFIX_RE);
  return match ? match[1]!.toUpperCase() : null;
}

function floorToNumber(floorId: string): number {
  const upper = floorId.toUpperCase();
  if (upper === "RF") return 999;
  if (upper.startsWith("B")) return -parseInt(upper.slice(1), 10);
  return parseInt(upper, 10);
}

function autoNavMeshParams(meshes: AbstractMesh[]): INavMeshParameters {
  let minX = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxZ = -Infinity;
  for (const m of meshes) {
    m.refreshBoundingInfo({});
    const b = m.getBoundingInfo().boundingBox;
    minX = Math.min(minX, b.minimumWorld.x);
    minZ = Math.min(minZ, b.minimumWorld.z);
    maxX = Math.max(maxX, b.maximumWorld.x);
    maxZ = Math.max(maxZ, b.maximumWorld.z);
  }
  const maxHorizExtent = Math.max(maxX - minX, maxZ - minZ);
  const cs = Math.max(0.05, maxHorizExtent / 300);
  const ch = cs * 0.5;
  return {
    cs,
    ch,
    walkableSlopeAngle: 50,
    walkableHeight: Math.ceil(1.7 / ch),
    walkableClimb: Math.ceil(0.4 / ch),
    walkableRadius: Math.max(1, Math.ceil(0.2 / cs)),
    maxEdgeLen: Math.ceil(12 * (maxHorizExtent / 50)),
    maxSimplificationError: 1.3,
    minRegionArea: Math.ceil(4 * (cs / 0.2) * (cs / 0.2)),
    mergeRegionArea: Math.ceil(10 * (cs / 0.2) * (cs / 0.2)),
    maxVertsPerPoly: 6,
    detailSampleDist: Math.max(1, cs * 6),
    detailSampleMaxError: ch,
  };
}

function meshGroupBounds(meshes: AbstractMesh[]) {
  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;
  for (const m of meshes) {
    m.computeWorldMatrix(true);
    m.refreshBoundingInfo({});
    const b = m.getBoundingInfo().boundingBox;
    minX = Math.min(minX, b.minimumWorld.x);
    minY = Math.min(minY, b.minimumWorld.y);
    minZ = Math.min(minZ, b.minimumWorld.z);
    maxX = Math.max(maxX, b.maximumWorld.x);
    maxY = Math.max(maxY, b.maximumWorld.y);
    maxZ = Math.max(maxZ, b.maximumWorld.z);
  }
  return { min: new Vector3(minX, minY, minZ), max: new Vector3(maxX, maxY, maxZ) };
}

function isOriginVec(v: Vector3): boolean {
  return Math.abs(v.x) < 0.01 && Math.abs(v.y) < 0.01 && Math.abs(v.z) < 0.01;
}

// ---------------------------------------------------------------------------
// Stair connection helpers
// ---------------------------------------------------------------------------

/**
 * Find stair entrance on a floor's NavMesh.
 * Simple approach: use stair mesh bounding box center XZ at floor elevation,
 * then snap to NavMesh. Try multiple query extents from tight to generous.
 */
function findStairEntrance(
  stairMeshes: AbstractMesh[],
  floorElevation: number,
  plugin: RecastJSPlugin
): Vector3 | null {
  if (stairMeshes.length === 0) return null;

  const bounds = meshGroupBounds(stairMeshes);
  const cx = (bounds.min.x + bounds.max.x) / 2;
  const cz = (bounds.min.z + bounds.max.z) / 2;

  // Probe at stair center and 4 edges (offset outward by 1.5m into corridor)
  const offset = 1.5;
  const probes = [
    new Vector3(cx, floorElevation, bounds.min.z - offset),
    new Vector3(cx, floorElevation, bounds.max.z + offset),
    new Vector3(bounds.min.x - offset, floorElevation, cz),
    new Vector3(bounds.max.x + offset, floorElevation, cz),
    new Vector3(cx, floorElevation, cz), // center as fallback
  ];

  // Use small extent for precise snapping
  plugin.setDefaultQueryExtent(new Vector3(3, 2, 3));

  let bestPos: Vector3 | null = null;
  let bestDrift = Infinity;

  for (const probe of probes) {
    const snapped = plugin.getClosestPoint(probe);
    if (isOriginVec(snapped)) continue;
    if (Math.abs(snapped.y - floorElevation) > 2) continue;
    const drift = Vector3.Distance(probe, snapped);
    if (drift < bestDrift) {
      bestDrift = drift;
      bestPos = snapped;
    }
  }

  // Restore default extent
  plugin.setDefaultQueryExtent(new Vector3(5, 3, 5));

  if (bestPos) {
    console.log(
      `[Pathfinding]     entrance: (${bestPos.x.toFixed(1)}, ${bestPos.y.toFixed(2)}, ${bestPos.z.toFixed(1)}), drift=${bestDrift.toFixed(2)}`
    );
  } else {
    console.warn(`[Pathfinding]     entrance NOT found`);
  }
  return bestPos;
}

/**
 * Build stair path that follows the physical stairwell slope.
 * Creates a diagonal path along the stair's run direction (X or Z),
 * so the agent visually walks up/down the stairs.
 */
function makeStairPath(
  from: Vector3,
  to: Vector3,
  stairBBox: { min: Vector3; max: Vector3 },
  goingUp: boolean
): Vector3[] {
  const SEGMENTS = 14;
  const points: Vector3[] = [from.clone()];

  const cx = (stairBBox.min.x + stairBBox.max.x) / 2;
  const cz = (stairBBox.min.z + stairBBox.max.z) / 2;
  const dx = stairBBox.max.x - stairBBox.min.x;
  const dz = stairBBox.max.z - stairBBox.min.z;
  const runAlongZ = dz >= dx;

  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const y = from.y + (to.y - from.y) * t;

    if (runAlongZ) {
      const startZ = goingUp ? stairBBox.min.z : stairBBox.max.z;
      const endZ = goingUp ? stairBBox.max.z : stairBBox.min.z;
      points.push(new Vector3(cx, y, startZ + (endZ - startZ) * t));
    } else {
      const startX = goingUp ? stairBBox.min.x : stairBBox.max.x;
      const endX = goingUp ? stairBBox.max.x : stairBBox.min.x;
      points.push(new Vector3(startX + (endX - startX) * t, y, cz));
    }
  }

  points.push(to.clone());
  return points;
}

// ---------------------------------------------------------------------------
// Per-floor data
// ---------------------------------------------------------------------------

interface FloorData {
  floorId: string;
  elevation: number;
  plugin: RecastJSPlugin;
  walkableMeshes: AbstractMesh[];
  debugMesh: Mesh | null;
  stairConnections: StairConnection[];
}

interface StairConnection {
  type: "stair" | "elevator";
  connectsTo: string;
  entranceOnThisFloor: Vector3;
  entranceOnOtherFloor: Vector3;
  stairBBox: { min: Vector3; max: Vector3 } | null; // null for elevator
  goingUp: boolean;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ObstacleInfo {
  id: string;
  type: "box" | "wall";
  position: { x: number; y: number; z: number };
  size: { w: number; h: number; d: number };
  /** Wall endpoints (wall type only) */
  from?: { x: number; y: number; z: number };
  to?: { x: number; y: number; z: number };
}

export interface PathfindingManager {
  initialize(): Promise<void>;
  detectWalkableMeshes(meshes: AbstractMesh[]): AbstractMesh[];
  getWalkableMeshes(): AbstractMesh[];
  setWalkableMeshes(meshes: AbstractMesh[]): void;
  buildNavMesh(params?: Partial<INavMeshParameters>): boolean;
  isNavMeshReady(): boolean;
  computePath(start: Vector3, end: Vector3): Vector3[];
  setStartPoint(pos: Vector3): void;
  setEndPoint(pos: Vector3): void;
  getStartPoint(): Vector3 | null;
  getEndPoint(): Vector3 | null;
  getPathDistance(): number;
  getWaypoints(): Vector3[];
  startAnimation(speed?: number): void;
  stopAnimation(): void;
  isAnimating(): boolean;
  showDebugNavMesh(show: boolean): void;
  clearPath(): void;
  // Obstacles & Walls
  addObstacle(pos: Vector3, size?: { w: number; h: number; d: number }): string;
  addWall(from: Vector3, to: Vector3, height?: number, thickness?: number): string;
  addWallWithDoor(
    from: Vector3,
    to: Vector3,
    height?: number,
    thickness?: number,
    doorWidth?: number,
    doorHeight?: number
  ): string;
  addDoorToWall(
    wallId: string,
    doorWidth?: number,
    doorHeight?: number,
    hitPoint?: Vector3
  ): string | null;
  findObstacleByMesh(mesh: AbstractMesh): string | null;
  getWallMeshes(): { id: string; meshes: Mesh[] }[];
  getAllObstacleMeshes(): Mesh[];
  getWallEndpoints(): { x: number; y: number; z: number }[];
  removeObstacle(id: string): void;
  getObstacles(): ObstacleInfo[];
  clearObstacles(): void;
  dispose(): void;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createPathfindingManager(
  scene: Scene,
  allMeshes: AbstractMesh[]
): PathfindingManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recastModule: any = null;
  let initialized = false;
  let navMeshBuilt = false;

  let floors: Map<string, FloorData> = new Map();
  let sortedFloorIds: string[] = [];
  let helperMeshes: Mesh[] = []; // Virtual landing quads for NavMesh generation

  let walkableMeshes = detectWalkableMeshes(allMeshes);
  let currentWaypoints: Vector3[] = [];
  let pathDistance = 0;

  let startMarker: Mesh | null = null;
  let endMarker: Mesh | null = null;
  let agentSphere: Mesh | null = null;
  let pathLine: Mesh | null = null;
  let startPoint: Vector3 | null = null;
  let endPoint: Vector3 | null = null;

  let animating = false;
  let animProgress = 0;
  let animSpeed = 1;
  let animObserver: Observer<Scene> | null = null;

  let startMat: StandardMaterial | null = null;
  let endMat: StandardMaterial | null = null;
  let agentMat: StandardMaterial | null = null;
  let pathMat: StandardMaterial | null = null;
  let debugMat: StandardMaterial | null = null;
  let obstacleMat: StandardMaterial | null = null;

  // Obstacles: meshes → NavMesh input, visuals → display only (doors etc.)
  let obstacleCounter = 0;
  const obstacles = new Map<string, { meshes: Mesh[]; visuals: Mesh[]; info: ObstacleInfo }>();

  // --- Initialize ---

  async function initialize(): Promise<void> {
    if (initialized) return;
    const mod = await import("recast-detour");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const factory = mod.default as any;
    const target: Record<string, unknown> = {};
    const recast = await factory.call(target);
    recastModule = recast ?? target["Recast"];
    initialized = true;
  }

  function createPlugin(): RecastJSPlugin {
    return new RecastJSPlugin(recastModule);
  }

  // --- Walkable mesh detection ---

  function detectWalkableMeshes(meshes: AbstractMesh[]): AbstractMesh[] {
    return meshes.filter((m) => {
      if (m.getTotalVertices() === 0) return false;
      const name = m.name.toLowerCase();
      if (WALKABLE_KEYWORDS.some((kw) => name.includes(kw))) return true;
      if (WALKABLE_SUFFIXES.some((s) => hasSegment(name, s))) return true;
      return false;
    });
  }

  function getWalkableMeshes(): AbstractMesh[] {
    return walkableMeshes;
  }
  function setWalkableMeshes(meshes: AbstractMesh[]): void {
    walkableMeshes = meshes;
  }

  // --- Floor grouping ---

  function groupMeshesByFloor() {
    const groups = new Map<
      string,
      {
        navInput: AbstractMesh[]; // All meshes for NavMesh input (walls, floors, ceilings, stairs)
        walkable: AbstractMesh[]; // Floor + stair meshes (for parameter calculation)
        stairs: AbstractMesh[]; // Stair meshes (for entrance detection)
        elevators: AbstractMesh[]; // Elevator landing meshes (for EV connection detection)
      }
    >();

    for (const m of allMeshes) {
      if (m.getTotalVertices() === 0) continue;
      const floorId = extractFloor(m.name) ?? "UNKNOWN";
      let group = groups.get(floorId);
      if (!group) {
        group = { navInput: [], walkable: [], stairs: [], elevators: [] };
        groups.set(floorId, group);
      }

      const nameLower = m.name.toLowerCase();
      const isExcluded = OBSTACLE_EXCLUDE_SUFFIXES.some((s) => hasSegment(nameLower, s));
      const isStair = hasSegment(nameLower, STAIR_SUFFIX);
      const isEV = hasSegment(nameLower, EV_SUFFIX);

      if (isStair) {
        group.stairs.push(m);
        // Stair step geometry excluded from NavMesh — ramp helper is used instead
        continue;
      }

      if (isEV) {
        group.elevators.push(m);
        // EV landing IS valid NavMesh geometry (flat surface, unlike stair steps)
      }

      if (!isExcluded) group.navInput.push(m);
      if (walkableMeshes.includes(m)) group.walkable.push(m);
    }

    return groups;
  }

  function floorElevation(walkableMeshes: AbstractMesh[]): number {
    const floorOnly = walkableMeshes.filter((m) => hasSegment(m.name.toLowerCase(), "_fl"));
    const targets = floorOnly.length > 0 ? floorOnly : walkableMeshes;
    if (targets.length === 0) return 0;
    let sum = 0;
    for (const m of targets) sum += m.getBoundingInfo().boundingBox.maximumWorld.y;
    return sum / targets.length;
  }

  // --- NavMesh ---

  function buildNavMesh(params?: Partial<INavMeshParameters>): boolean {
    if (!recastModule || walkableMeshes.length === 0) {
      console.warn("[Pathfinding] Cannot build: not initialized or no walkable meshes");
      return false;
    }

    disposeFloors();

    const meshGroups = groupMeshesByFloor();
    const knownFloors = [...meshGroups.keys()].filter((k) => k !== "UNKNOWN");

    if (knownFloors.length === 0) return buildSingleNavMesh(params);

    sortedFloorIds = knownFloors.sort((a, b) => floorToNumber(a) - floorToNumber(b));
    console.log("[Pathfinding] Floors:", sortedFloorIds.join(", "));

    let anySuccess = false;

    for (let fi = 0; fi < sortedFloorIds.length; fi++) {
      const floorId = sortedFloorIds[fi]!;
      const group = meshGroups.get(floorId)!;
      if (group.walkable.length === 0) {
        console.log(`[Pathfinding] ${floorId}: no walkable meshes, skip`);
        continue;
      }

      const inputMeshes = [...group.navInput];
      const elev = floorElevation(group.walkable);

      // Add nearby UNKNOWN meshes (user-added walls, obstacles, etc.)
      const unknownGroup = meshGroups.get("UNKNOWN");
      if (unknownGroup) {
        for (const m of unknownGroup.navInput) {
          m.computeWorldMatrix(true);
          m.refreshBoundingInfo({});
          const mY = m.getBoundingInfo().boundingBox.maximumWorld.y;
          if (Math.abs(mY - elev) < 5) {
            inputMeshes.push(m);
            console.log(
              `[Pathfinding] ${floorId}: +UNKNOWN mesh "${m.name}" (maxY=${mY.toFixed(2)}, verts=${m.getTotalVertices()})`
            );
          }
        }
      }

      // Create ramp for this floor's stairs (smooth slope surface for NavMesh)
      // Recast can't handle individual step geometry (insufficient headroom between treads)
      // so we replace steps with a tilted plane at the correct slope angle.
      if (group.stairs.length > 0 && fi + 1 < sortedFloorIds.length) {
        const nextFloorId = sortedFloorIds[fi + 1]!;
        const nextGroup = meshGroups.get(nextFloorId);
        if (nextGroup && nextGroup.walkable.length > 0) {
          const nextElev = floorElevation(nextGroup.walkable);
          const sb = meshGroupBounds(group.stairs);
          const cx = (sb.min.x + sb.max.x) / 2;
          const halfW = Math.max((sb.max.x - sb.min.x) / 2, 0.75);

          const ramp = MeshBuilder.CreateRibbon(
            `__pf_ramp_${floorId}`,
            {
              pathArray: [
                [new Vector3(cx - halfW, elev, sb.min.z), new Vector3(cx + halfW, elev, sb.min.z)],
                [
                  new Vector3(cx - halfW, nextElev, sb.max.z),
                  new Vector3(cx + halfW, nextElev, sb.max.z),
                ],
              ],
            },
            scene
          );
          ramp.isVisible = false;
          ramp.isPickable = false;
          ramp.computeWorldMatrix(true);
          inputMeshes.push(ramp);
          helperMeshes.push(ramp);
          console.log(
            `[Pathfinding] ${floorId}: ramp → ${nextFloorId}, ` +
              `(${cx.toFixed(1)}, ${elev.toFixed(2)}, ${sb.min.z.toFixed(1)}) → ` +
              `(${cx.toFixed(1)}, ${nextElev.toFixed(2)}, ${sb.max.z.toFixed(1)})`
          );
        }
      }

      // Landing quad where lower floor's stairs arrive at this floor
      if (fi > 0) {
        const prevFloorId = sortedFloorIds[fi - 1]!;
        const prevGroup = meshGroups.get(prevFloorId);
        if (prevGroup && prevGroup.stairs.length > 0) {
          const sb = meshGroupBounds(prevGroup.stairs);
          const cx = (sb.min.x + sb.max.x) / 2;
          const landing = MeshBuilder.CreateGround(
            `__pf_landing_${floorId}`,
            { width: 3, height: 3 },
            scene
          );
          landing.position = new Vector3(cx, elev, sb.max.z);
          landing.isVisible = false;
          landing.isPickable = false;
          landing.computeWorldMatrix(true);
          inputMeshes.push(landing);
          helperMeshes.push(landing);
          console.log(
            `[Pathfinding] ${floorId}: landing from ${prevFloorId} at (${cx.toFixed(1)}, ${elev.toFixed(2)}, ${sb.max.z.toFixed(1)})`
          );
        }
      }

      const plugin = createPlugin();
      const navParams = { ...autoNavMeshParams(group.walkable), ...params };

      // Ensure all input meshes have up-to-date world matrices
      for (const m of inputMeshes) m.computeWorldMatrix(true);

      try {
        plugin.createNavMesh(inputMeshes as Mesh[], navParams);
        plugin.setDefaultQueryExtent(new Vector3(5, 3, 5));

        floors.set(floorId, {
          floorId,
          elevation: elev,
          plugin,
          walkableMeshes: group.walkable,
          stairConnections: [],
          debugMesh: null,
        });
        anySuccess = true;
        console.log(
          `[Pathfinding] ${floorId}: NavMesh OK, elev=${elev.toFixed(2)}, input=${inputMeshes.length}, walkable=${group.walkable.length}, stairs=${group.stairs.length}`
        );
      } catch (err) {
        console.error(`[Pathfinding] ${floorId}: NavMesh failed:`, err);
        plugin.dispose();
      }
    }

    if (anySuccess) {
      // EV connections first → BFS prefers elevator over stairs
      buildElevatorConnections(meshGroups);
      buildStairConnections(meshGroups);
      navMeshBuilt = true;
    }

    return anySuccess;
  }

  /**
   * Build stair connections between adjacent floors.
   * Uses each floor's stair meshes to find entrance positions on each floor's NavMesh.
   */
  type MeshGroup = {
    navInput: AbstractMesh[];
    walkable: AbstractMesh[];
    stairs: AbstractMesh[];
    elevators: AbstractMesh[];
  };

  function buildStairConnections(meshGroups: Map<string, MeshGroup>): void {
    const activeFloors = sortedFloorIds.filter((id) => floors.has(id));

    // Log stair info per floor
    for (const floorId of activeFloors) {
      const stairs = meshGroups.get(floorId)?.stairs ?? [];
      if (stairs.length > 0) {
        const bounds = meshGroupBounds(stairs);
        console.log(
          `[Pathfinding] ${floorId}: ${stairs.length} stair meshes, ` +
            `bbox center XZ=(${((bounds.min.x + bounds.max.x) / 2).toFixed(1)}, ${((bounds.min.z + bounds.max.z) / 2).toFixed(1)}), ` +
            `Y=[${bounds.min.y.toFixed(1)}, ${bounds.max.y.toFixed(1)}]`
        );
      }
    }

    // Connect adjacent floor pairs
    for (let i = 0; i < activeFloors.length - 1; i++) {
      const lowerId = activeFloors[i]!;
      const upperId = activeFloors[i + 1]!;
      const lowerFd = floors.get(lowerId)!;
      const upperFd = floors.get(upperId)!;

      // Use EACH floor's own stair meshes for that floor's entrance
      const lowerStairs = meshGroups.get(lowerId)?.stairs ?? [];
      const upperStairs = meshGroups.get(upperId)?.stairs ?? [];

      // Need at least one side to have stairs
      if (lowerStairs.length === 0 && upperStairs.length === 0) continue;

      console.log(
        `[Pathfinding]   Connecting ${lowerId}(elev=${lowerFd.elevation.toFixed(1)}) ↔ ${upperId}(elev=${upperFd.elevation.toFixed(1)}):`
      );

      // Find entrance on lower floor using lower floor's stair meshes
      // If lower has no stairs, use upper's stair meshes as fallback (same XZ location)
      const lowerProbeStairs = lowerStairs.length > 0 ? lowerStairs : upperStairs;
      console.log(
        `[Pathfinding]     ${lowerId} entrance (using ${lowerStairs.length > 0 ? lowerId : upperId} stairs):`
      );
      const lowerEntrance = findStairEntrance(lowerProbeStairs, lowerFd.elevation, lowerFd.plugin);

      // Find entrance on upper floor using upper floor's stair meshes
      const upperProbeStairs = upperStairs.length > 0 ? upperStairs : lowerStairs;
      console.log(
        `[Pathfinding]     ${upperId} entrance (using ${upperStairs.length > 0 ? upperId : lowerId} stairs):`
      );
      const upperEntrance = findStairEntrance(upperProbeStairs, upperFd.elevation, upperFd.plugin);

      if (!lowerEntrance || !upperEntrance) {
        console.warn(
          `[Pathfinding]     Skipping: entrance not found (lower=${!!lowerEntrance}, upper=${!!upperEntrance})`
        );
        continue;
      }

      // Compute stair bounding box from all stair meshes involved
      const allStairs = [...lowerStairs, ...upperStairs];
      const stairBounds = meshGroupBounds(allStairs.length > 0 ? allStairs : lowerProbeStairs);
      const stairBBox = { min: stairBounds.min.clone(), max: stairBounds.max.clone() };

      // Lower → Upper
      lowerFd.stairConnections.push({
        type: "stair",
        connectsTo: upperId,
        entranceOnThisFloor: lowerEntrance,
        entranceOnOtherFloor: upperEntrance,
        stairBBox,
        goingUp: true,
      });

      // Upper → Lower
      upperFd.stairConnections.push({
        type: "stair",
        connectsTo: lowerId,
        entranceOnThisFloor: upperEntrance,
        entranceOnOtherFloor: lowerEntrance,
        stairBBox,
        goingUp: false,
      });

      console.log(`[Pathfinding]     ${lowerId} ↔ ${upperId} connected`);
    }

    // Summary
    for (const [id, fd] of floors) {
      if (fd.stairConnections.length > 0) {
        console.log(
          `[Pathfinding] ${id}: ${fd.stairConnections.length} stair connection(s) → ${fd.stairConnections.map((c) => c.connectsTo).join(", ")}`
        );
      }
    }
  }

  /**
   * Find elevator entrance on a floor's NavMesh.
   * Probes at the EV mesh center, snaps to NavMesh.
   */
  function findElevatorEntrance(
    evMeshes: AbstractMesh[],
    floorElevation: number,
    plugin: RecastJSPlugin
  ): Vector3 | null {
    if (evMeshes.length === 0) return null;

    const bounds = meshGroupBounds(evMeshes);
    const cx = (bounds.min.x + bounds.max.x) / 2;
    const cz = (bounds.min.z + bounds.max.z) / 2;
    console.log(
      `[Pathfinding]     EV mesh bounds: (${bounds.min.x.toFixed(1)},${bounds.min.z.toFixed(1)}) → (${bounds.max.x.toFixed(1)},${bounds.max.z.toFixed(1)}), probe=(${cx.toFixed(1)},${cz.toFixed(1)})`
    );

    // Probe at EV center and 4 edges (offset outward by 1.5m into corridor)
    const offset = 1.5;
    const probes = [
      new Vector3(cx, floorElevation, bounds.min.z - offset),
      new Vector3(cx, floorElevation, bounds.max.z + offset),
      new Vector3(bounds.min.x - offset, floorElevation, cz),
      new Vector3(bounds.max.x + offset, floorElevation, cz),
      new Vector3(cx, floorElevation, cz), // center as fallback
    ];

    plugin.setDefaultQueryExtent(new Vector3(3, 2, 3));

    let bestPos: Vector3 | null = null;
    let bestDrift = Infinity;

    for (const probe of probes) {
      const snapped = plugin.getClosestPoint(probe);
      if (isOriginVec(snapped)) continue;
      if (Math.abs(snapped.y - floorElevation) > 2) continue;
      const drift = Vector3.Distance(probe, snapped);
      if (drift < bestDrift) {
        bestDrift = drift;
        bestPos = snapped;
      }
    }

    plugin.setDefaultQueryExtent(new Vector3(5, 3, 5));

    if (bestPos) {
      console.log(
        `[Pathfinding]     EV entrance: (${bestPos.x.toFixed(1)}, ${bestPos.y.toFixed(2)}, ${bestPos.z.toFixed(1)}), drift=${bestDrift.toFixed(2)}`
      );
    } else {
      console.warn(`[Pathfinding]     EV entrance NOT found`);
    }
    return bestPos;
  }

  /**
   * Create a vertical path for elevator transition.
   * Path goes from the entrance on the departure floor straight up/down
   * to the entrance on the arrival floor, staying at the EV shaft X/Z.
   */
  function makeElevatorPath(from: Vector3, to: Vector3): Vector3[] {
    const SEGMENTS = 8;
    const points: Vector3[] = [from.clone()];

    // Use 'from' X/Z for departure, linearly interpolate to 'to' X/Z
    // (they should be nearly identical — both are at the elevator shaft)
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      points.push(
        new Vector3(
          from.x + (to.x - from.x) * t,
          from.y + (to.y - from.y) * t,
          from.z + (to.z - from.z) * t
        )
      );
    }

    points.push(to.clone());
    return points;
  }

  /**
   * Build elevator connections between ALL floors that have EV meshes.
   * Unlike stairs (adjacent only), elevator connects every pair directly.
   */
  function buildElevatorConnections(meshGroups: Map<string, MeshGroup>): void {
    const activeFloors = sortedFloorIds.filter((id) => floors.has(id));

    // Find floors with EV meshes
    const evFloors: string[] = [];
    for (const floorId of activeFloors) {
      const evMeshes = meshGroups.get(floorId)?.elevators ?? [];
      if (evMeshes.length > 0) evFloors.push(floorId);
    }

    if (evFloors.length < 2) return;
    console.log(`[Pathfinding] EV floors: ${evFloors.join(", ")}`);

    // Connect every pair of EV floors
    for (let i = 0; i < evFloors.length; i++) {
      for (let j = i + 1; j < evFloors.length; j++) {
        const lowerId = evFloors[i]!;
        const upperId = evFloors[j]!;
        const lowerFd = floors.get(lowerId)!;
        const upperFd = floors.get(upperId)!;

        const lowerEVs = meshGroups.get(lowerId)!.elevators;
        const upperEVs = meshGroups.get(upperId)!.elevators;

        console.log(`[Pathfinding]   EV connecting ${lowerId} ↔ ${upperId}:`);
        const lowerEntrance = findElevatorEntrance(lowerEVs, lowerFd.elevation, lowerFd.plugin);
        const upperEntrance = findElevatorEntrance(upperEVs, upperFd.elevation, upperFd.plugin);

        if (!lowerEntrance || !upperEntrance) {
          console.warn(
            `[Pathfinding]     EV: entrance not found (lower=${!!lowerEntrance}, upper=${!!upperEntrance})`
          );
          continue;
        }

        // Lower → Upper (EV)
        lowerFd.stairConnections.push({
          type: "elevator",
          connectsTo: upperId,
          entranceOnThisFloor: lowerEntrance,
          entranceOnOtherFloor: upperEntrance,
          stairBBox: null,
          goingUp: true,
        });

        // Upper → Lower (EV)
        upperFd.stairConnections.push({
          type: "elevator",
          connectsTo: lowerId,
          entranceOnThisFloor: upperEntrance,
          entranceOnOtherFloor: lowerEntrance,
          stairBBox: null,
          goingUp: false,
        });

        console.log(`[Pathfinding]     EV: ${lowerId} ↔ ${upperId} connected`);
      }
    }

    // Summary
    for (const [id, fd] of floors) {
      const evConns = fd.stairConnections.filter((c) => c.type === "elevator");
      if (evConns.length > 0) {
        console.log(
          `[Pathfinding] ${id}: ${evConns.length} EV connection(s) → ${evConns.map((c) => c.connectsTo).join(", ")}`
        );
      }
    }
  }

  function buildSingleNavMesh(params?: Partial<INavMeshParameters>): boolean {
    const plugin = createPlugin();
    const inputMeshes = allMeshes.filter((m) => {
      if (m.getTotalVertices() === 0) return false;
      return !OBSTACLE_EXCLUDE_SUFFIXES.some((s) => hasSegment(m.name.toLowerCase(), s));
    });
    try {
      plugin.createNavMesh(inputMeshes as Mesh[], {
        ...autoNavMeshParams(walkableMeshes),
        ...params,
      });
      plugin.setDefaultQueryExtent(new Vector3(5, 50, 5));
      floors.set("ALL", {
        floorId: "ALL",
        elevation: 0,
        plugin,
        walkableMeshes,
        stairConnections: [],
        debugMesh: null,
      });
      sortedFloorIds = ["ALL"];
      navMeshBuilt = true;
      return true;
    } catch (err) {
      console.error("[Pathfinding] Single NavMesh failed:", err);
      plugin.dispose();
      return false;
    }
  }

  function isNavMeshReady(): boolean {
    return navMeshBuilt;
  }

  // --- Floor detection ---

  function findFloorForPoint(pos: Vector3): string | null {
    if (floors.size === 0) return null;
    if (floors.size === 1) return floors.keys().next().value ?? null;
    let bestFloor: string | null = null;
    let bestDist = Infinity;
    for (const [id, fd] of floors) {
      const dist = Math.abs(pos.y - fd.elevation);
      if (dist < bestDist) {
        bestDist = dist;
        bestFloor = id;
      }
    }
    return bestFloor;
  }

  // --- Cross-floor routing ---

  /**
   * BFS floor route. Optional typeFilter restricts to stair-only or elevator-only connections.
   */
  function findFloorRoute(
    fromFloor: string,
    toFloor: string,
    typeFilter?: "stair" | "elevator"
  ): string[] | null {
    if (fromFloor === toFloor) return [fromFloor];
    const visited = new Set<string>([fromFloor]);
    const queue: { floor: string; path: string[] }[] = [{ floor: fromFloor, path: [fromFloor] }];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      const fd = floors.get(cur.floor);
      if (!fd) continue;
      const conns = typeFilter
        ? fd.stairConnections.filter((c) => c.type === typeFilter)
        : fd.stairConnections;
      for (const conn of conns) {
        if (visited.has(conn.connectsTo) || !floors.has(conn.connectsTo)) continue;
        const newPath = [...cur.path, conn.connectsTo];
        if (conn.connectsTo === toFloor) return newPath;
        visited.add(conn.connectsTo);
        queue.push({ floor: conn.connectsTo, path: newPath });
      }
    }
    return null;
  }

  function getStairConnection(
    fromFloor: string,
    toFloor: string,
    preferType?: "stair" | "elevator"
  ): StairConnection | null {
    const fd = floors.get(fromFloor);
    if (!fd) return null;
    if (preferType) {
      const preferred = fd.stairConnections.find(
        (c) => c.connectsTo === toFloor && c.type === preferType
      );
      if (preferred) return preferred;
    }
    return fd.stairConnections.find((c) => c.connectsTo === toFloor) ?? null;
  }

  /** Compute NavMesh path on a single floor */
  function computeFloorPath(floorId: string, start: Vector3, end: Vector3): Vector3[] {
    const fd = floors.get(floorId);
    if (!fd) return [];
    const snappedStart = fd.plugin.getClosestPoint(start);
    const snappedEnd = fd.plugin.getClosestPoint(end);
    if (isOriginVec(snappedStart) || isOriginVec(snappedEnd)) {
      console.warn(`[Pathfinding]   ${floorId}: getClosestPoint returned origin`);
      return [];
    }
    const path = fd.plugin.computePath(snappedStart, snappedEnd);

    // Validate: Recast returns a "partial path" (closest reachable point) when
    // the destination is unreachable. Check if the last waypoint actually
    // reaches the snapped destination. If not, the path is blocked.
    if (path.length > 0) {
      const lastPt = path[path.length - 1]!;
      const distToEnd = Vector3.Distance(lastPt, snappedEnd);
      if (distToEnd > 1.0) {
        console.warn(
          `[Pathfinding]   ${floorId}: path blocked — last waypoint ${distToEnd.toFixed(1)}m from destination`
        );
        return [];
      }
    }

    console.log(`[Pathfinding]   ${floorId}: ${path.length} waypoints`);
    return path;
  }

  // --- Path computation ---

  function computePath(start: Vector3, end: Vector3): Vector3[] {
    if (!navMeshBuilt || floors.size === 0) return [];

    const startFloor = findFloorForPoint(start);
    const endFloor = findFloorForPoint(end);
    console.log(
      `[Pathfinding] computePath: ${startFloor}(Y=${start.y.toFixed(2)}) → ${endFloor}(Y=${end.y.toFixed(2)})`
    );

    if (!startFloor || !endFloor) return [];

    let fullPath: Vector3[];

    if (startFloor === endFloor) {
      fullPath = computeFloorPath(startFloor, start, end);
    } else {
      // Try both stair and elevator routes, pick shortest total distance
      const candidates: { path: Vector3[]; dist: number; via: string }[] = [];

      // Try elevator route
      const evRoute = findFloorRoute(startFloor, endFloor, "elevator");
      if (evRoute && evRoute.length >= 2) {
        console.log(`[Pathfinding]   EV route found: ${evRoute.join(" → ")}`);
        const p = buildCrossFloorPath(evRoute, start, end, "elevator");
        if (p.length > 0) {
          candidates.push({ path: p, dist: calculatePathDistance(p), via: "EV" });
        } else {
          console.log(`[Pathfinding]   EV route: floor path blocked`);
        }
      } else {
        console.log(
          `[Pathfinding]   EV route: no BFS route (evRoute=${evRoute ? evRoute.length : "null"})`
        );
      }

      // Try stair route
      const stairRoute = findFloorRoute(startFloor, endFloor, "stair");
      if (stairRoute && stairRoute.length >= 2) {
        console.log(`[Pathfinding]   Stair route found: ${stairRoute.join(" → ")}`);
        const p = buildCrossFloorPath(stairRoute, start, end, "stair");
        if (p.length > 0) {
          candidates.push({ path: p, dist: calculatePathDistance(p), via: "stair" });
        } else {
          console.log(`[Pathfinding]   Stair route: floor path blocked`);
        }
      } else {
        console.log(
          `[Pathfinding]   Stair route: no BFS route (stairRoute=${stairRoute ? stairRoute.length : "null"})`
        );
      }

      // Pick shortest
      candidates.sort((a, b) => a.dist - b.dist);
      if (candidates.length > 0) {
        const best = candidates[0]!;
        console.log(
          `[Pathfinding] Route comparison: ${candidates.map((c) => `${c.via}=${c.dist.toFixed(1)}m`).join(" vs ")} → chose ${best.via}`
        );
        fullPath = best.path;
      } else {
        // Fallback: try any route
        const anyRoute = findFloorRoute(startFloor, endFloor);
        if (!anyRoute || anyRoute.length < 2) {
          console.warn(`[Pathfinding] No route ${startFloor} → ${endFloor}`);
          return [];
        }
        fullPath = buildCrossFloorPath(anyRoute, start, end);
      }
    }

    currentWaypoints = fullPath;
    pathDistance = calculatePathDistance(fullPath);
    if (fullPath.length > 0) {
      console.log(`[Pathfinding] Result: ${fullPath.length} pts, dist=${pathDistance.toFixed(1)}m`);
      drawPath(fullPath);
    } else {
      console.warn("[Pathfinding] No path found");
      clearPathVisuals();
    }
    return fullPath;
  }

  /**
   * Build cross-floor path:
   * For each floor transition:
   *   1. NavMesh path on current floor → stair entrance
   *   2. Vertex-traced stair path (follows actual stair geometry)
   *   3. Continue on next floor
   */
  function buildCrossFloorPath(
    route: string[],
    start: Vector3,
    end: Vector3,
    preferType?: "stair" | "elevator"
  ): Vector3[] {
    const fullPath: Vector3[] = [];

    function append(p: Vector3): void {
      if (fullPath.length > 0 && Vector3.Distance(fullPath[fullPath.length - 1]!, p) < 0.15) return;
      fullPath.push(p);
    }
    function appendAll(pts: Vector3[]): void {
      for (const p of pts) append(p);
    }

    for (let i = 0; i < route.length; i++) {
      const currentFloor = route[i]!;
      const isFirst = i === 0;
      const isLast = i === route.length - 1;

      let floorPathStart: Vector3;
      let floorPathEnd: Vector3;

      if (isFirst) {
        const conn = getStairConnection(currentFloor, route[i + 1]!, preferType);
        if (!conn) return [];
        floorPathStart = start;
        floorPathEnd = conn.entranceOnThisFloor;
      } else if (isLast) {
        const conn = getStairConnection(route[i - 1]!, currentFloor, preferType);
        if (!conn) return [];
        floorPathStart = conn.entranceOnOtherFloor;
        floorPathEnd = end;
      } else {
        const connIn = getStairConnection(route[i - 1]!, currentFloor, preferType);
        const connOut = getStairConnection(currentFloor, route[i + 1]!, preferType);
        if (!connIn || !connOut) return [];
        floorPathStart = connIn.entranceOnOtherFloor;
        floorPathEnd = connOut.entranceOnThisFloor;
      }

      // NavMesh path on this floor
      const floorPath = computeFloorPath(currentFloor, floorPathStart, floorPathEnd);
      if (floorPath.length > 0) {
        appendAll(floorPath);
      } else {
        // Path blocked on this floor (wall/obstacle in the way) — abort entire route
        console.warn(
          `[Pathfinding] buildCrossFloorPath: ${currentFloor} path blocked, aborting route`
        );
        return [];
      }

      // Floor transition (stair or elevator) to next floor
      if (!isLast) {
        const conn = getStairConnection(currentFloor, route[i + 1]!, preferType);
        if (!conn) continue;

        const pathEnd = fullPath.length > 0 ? fullPath[fullPath.length - 1]! : floorPathEnd;

        let transitionPts: Vector3[];
        if (conn.type === "elevator" || !conn.stairBBox) {
          // For elevator: walk to the exact EV entrance, then go vertically
          append(conn.entranceOnThisFloor);
          transitionPts = makeElevatorPath(conn.entranceOnThisFloor, conn.entranceOnOtherFloor);
          console.log(
            `[Pathfinding]   EV transition: (${conn.entranceOnThisFloor.x.toFixed(1)},${conn.entranceOnThisFloor.y.toFixed(1)},${conn.entranceOnThisFloor.z.toFixed(1)}) → ` +
              `(${conn.entranceOnOtherFloor.x.toFixed(1)},${conn.entranceOnOtherFloor.y.toFixed(1)},${conn.entranceOnOtherFloor.z.toFixed(1)})`
          );
        } else {
          // Stair transition: verify the ramp is not blocked before using geometric path.
          // The ramp is part of the LOWER floor's NavMesh, so check there.
          const lowerFloorId = conn.goingUp ? currentFloor : route[i + 1]!;
          const lowerFd = floors.get(lowerFloorId);
          if (lowerFd) {
            const rampBottom = conn.goingUp ? conn.entranceOnThisFloor : conn.entranceOnOtherFloor;
            const rampTop = conn.goingUp ? conn.entranceOnOtherFloor : conn.entranceOnThisFloor;
            const snappedBot = lowerFd.plugin.getClosestPoint(rampBottom);
            const snappedTop = lowerFd.plugin.getClosestPoint(rampTop);
            if (!isOriginVec(snappedBot) && !isOriginVec(snappedTop)) {
              const rampPath = lowerFd.plugin.computePath(snappedBot, snappedTop);
              if (rampPath.length > 0) {
                const lastPt = rampPath[rampPath.length - 1]!;
                const distToTop = Vector3.Distance(lastPt, snappedTop);
                if (distToTop > 2.0) {
                  console.warn(
                    `[Pathfinding]   Stair ramp ${currentFloor} → ${route[i + 1]!} blocked ` +
                      `(last waypoint ${distToTop.toFixed(1)}m from top), aborting route`
                  );
                  return [];
                }
              }
            }
          }
          transitionPts = makeStairPath(
            pathEnd,
            conn.entranceOnOtherFloor,
            conn.stairBBox,
            conn.goingUp
          );
        }

        // Skip first (duplicate of pathEnd) and last (will be start of next floor segment)
        for (let s = 1; s < transitionPts.length - 1; s++) {
          append(transitionPts[s]!);
        }
      }
    }

    return fullPath;
  }

  function calculatePathDistance(points: Vector3[]): number {
    let dist = 0;
    for (let i = 1; i < points.length; i++) dist += Vector3.Distance(points[i - 1]!, points[i]!);
    return dist;
  }

  // --- Markers ---

  function getOrCreateMaterial(
    name: string,
    color: Color3,
    cache: { mat: StandardMaterial | null }
  ): StandardMaterial {
    if (cache.mat) return cache.mat;
    const mat = new StandardMaterial(name, scene);
    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(0.4);
    mat.backFaceCulling = false;
    cache.mat = mat;
    return mat;
  }

  function setStartPoint(pos: Vector3): void {
    startPoint = pos;
    if (startMarker) {
      startMarker.position = pos;
    } else {
      startMarker = MeshBuilder.CreateSphere("__pf_start", { diameter: 0.6 }, scene);
      startMarker.position = pos;
      startMarker.material = getOrCreateMaterial("__pf_startMat", new Color3(0.1, 0.9, 0.2), {
        get mat() {
          return startMat;
        },
        set mat(v) {
          startMat = v;
        },
      });
      startMarker.isPickable = false;
    }
    tryComputePath();
  }

  function setEndPoint(pos: Vector3): void {
    endPoint = pos;
    if (endMarker) {
      endMarker.position = pos;
    } else {
      endMarker = MeshBuilder.CreateSphere("__pf_end", { diameter: 0.6 }, scene);
      endMarker.position = pos;
      endMarker.material = getOrCreateMaterial("__pf_endMat", new Color3(0.9, 0.1, 0.1), {
        get mat() {
          return endMat;
        },
        set mat(v) {
          endMat = v;
        },
      });
      endMarker.isPickable = false;
    }
    tryComputePath();
  }

  function getStartPoint(): Vector3 | null {
    return startPoint;
  }
  function getEndPoint(): Vector3 | null {
    return endPoint;
  }
  function getPathDistance(): number {
    return pathDistance;
  }
  function getWaypoints(): Vector3[] {
    return currentWaypoints;
  }

  function tryComputePath(): void {
    if (startPoint && endPoint && navMeshBuilt) computePath(startPoint, endPoint);
  }

  /** Remove path line only (keep markers) */
  function clearPathVisuals(): void {
    if (pathLine) {
      pathLine.dispose();
      pathLine = null;
    }
    if (agentSphere) {
      agentSphere.dispose();
      agentSphere = null;
    }
  }

  // --- Visualization ---

  function drawPath(waypoints: Vector3[]): void {
    if (pathLine) {
      pathLine.dispose();
      pathLine = null;
    }
    if (waypoints.length < 2) return;
    const elevated = waypoints.map((p) => new Vector3(p.x, p.y + 0.05, p.z));
    pathLine = MeshBuilder.CreateTube(
      "__pf_path",
      { path: elevated, radius: 0.08, tessellation: 8, updatable: false },
      scene
    );
    if (!pathMat) {
      pathMat = new StandardMaterial("__pf_pathMat", scene);
      pathMat.diffuseColor = new Color3(0.2, 0.5, 1.0);
      pathMat.emissiveColor = new Color3(0.1, 0.3, 0.8);
      pathMat.backFaceCulling = false;
    }
    pathLine.material = pathMat;
    pathLine.isPickable = false;
  }

  // --- Animation ---

  function startAnimation(speed = 1): void {
    if (currentWaypoints.length < 2) return;
    if (animating) stopAnimation();
    animSpeed = speed;
    animProgress = 0;
    animating = true;

    if (!agentSphere) {
      agentSphere = MeshBuilder.CreateSphere("__pf_agent", { diameter: 0.5 }, scene);
      if (!agentMat) {
        agentMat = new StandardMaterial("__pf_agentMat", scene);
        agentMat.diffuseColor = new Color3(0.2, 0.5, 1.0);
        agentMat.emissiveColor = new Color3(0.1, 0.3, 0.9);
      }
      agentSphere.material = agentMat;
      agentSphere.isPickable = false;
    }
    agentSphere.setEnabled(true);
    agentSphere.position = currentWaypoints[0]!.clone();

    animObserver = scene.onBeforeRenderObservable.add(() => {
      if (!animating || currentWaypoints.length < 2) return;
      animProgress += (scene.getEngine().getDeltaTime() / 1000) * animSpeed;
      if (animProgress >= pathDistance) {
        if (agentSphere)
          agentSphere.position = currentWaypoints[currentWaypoints.length - 1]!.clone();
        stopAnimation();
        return;
      }
      let acc = 0;
      for (let i = 1; i < currentWaypoints.length; i++) {
        const segLen = Vector3.Distance(currentWaypoints[i - 1]!, currentWaypoints[i]!);
        if (acc + segLen >= animProgress) {
          const t = segLen > 0 ? (animProgress - acc) / segLen : 0;
          if (agentSphere)
            agentSphere.position = Vector3.Lerp(currentWaypoints[i - 1]!, currentWaypoints[i]!, t);
          return;
        }
        acc += segLen;
      }
    });
  }

  function stopAnimation(): void {
    animating = false;
    if (animObserver) {
      scene.onBeforeRenderObservable.remove(animObserver);
      animObserver = null;
    }
    if (agentSphere) agentSphere.setEnabled(false);
  }

  // --- Debug ---

  function showDebugNavMesh(show: boolean): void {
    if (!navMeshBuilt) return;
    if (!debugMat) {
      debugMat = new StandardMaterial("__pf_debugMat", scene);
      debugMat.diffuseColor = new Color3(0.1, 0.2, 1.0);
      debugMat.alpha = 0.3;
      debugMat.backFaceCulling = false;
    }
    for (const [, fd] of floors) {
      if (show) {
        if (!fd.debugMesh) {
          fd.debugMesh = fd.plugin.createDebugNavMesh(scene);
          fd.debugMesh.material = debugMat;
          fd.debugMesh.isPickable = false;
        }
        fd.debugMesh.setEnabled(true);
      } else {
        if (fd.debugMesh) fd.debugMesh.setEnabled(false);
      }
    }
  }

  // --- Obstacles ---

  // --- Obstacle helpers ---

  function getOrCreateObstacleMat(): StandardMaterial {
    if (!obstacleMat) {
      obstacleMat = new StandardMaterial("__pf_obstacleMat", scene);
      obstacleMat.diffuseColor = new Color3(0.9, 0.3, 0.1);
      obstacleMat.emissiveColor = new Color3(0.3, 0.1, 0.02);
      obstacleMat.alpha = 0.7;
      obstacleMat.backFaceCulling = false;
    }
    return obstacleMat;
  }

  function getOrCreateWallMat(): StandardMaterial {
    let mat = scene.getMaterialByName("__pf_wallMat") as StandardMaterial | null;
    if (!mat) {
      mat = new StandardMaterial("__pf_wallMat", scene);

      // Procedural concrete texture
      const tex = new DynamicTexture("__pf_concreteTex", 256, scene, false);
      const ctx = tex.getContext();
      // Base concrete gray
      ctx.fillStyle = "#7a7672";
      ctx.fillRect(0, 0, 256, 256);
      // Speckle noise
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const g = 100 + Math.floor(Math.random() * 50);
        ctx.fillStyle = `rgb(${g},${g - 2},${g - 4})`;
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
      // Subtle cracks
      ctx.strokeStyle = "rgba(60,58,55,0.3)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 256, Math.random() * 256);
        ctx.lineTo(Math.random() * 256, Math.random() * 256);
        ctx.stroke();
      }
      tex.update();
      tex.uScale = 2;
      tex.vScale = 2;

      mat.diffuseTexture = tex;
      mat.specularColor = new Color3(0.12, 0.12, 0.12);
      mat.emissiveColor = new Color3(0.02, 0.02, 0.02);
      mat.backFaceCulling = false;
    }
    return mat;
  }

  function getOrCreateDoorFrameMat(): StandardMaterial {
    let mat = scene.getMaterialByName("__pf_doorFrameMat") as StandardMaterial | null;
    if (!mat) {
      mat = new StandardMaterial("__pf_doorFrameMat", scene);
      mat.diffuseColor = new Color3(0.25, 0.25, 0.28);
      mat.specularColor = new Color3(0.3, 0.3, 0.3);
      mat.emissiveColor = new Color3(0.02, 0.02, 0.03);
      mat.backFaceCulling = false;
    }
    return mat;
  }

  function getOrCreateDoorPanelMat(): StandardMaterial {
    let mat = scene.getMaterialByName("__pf_doorPanelMat") as StandardMaterial | null;
    if (!mat) {
      mat = new StandardMaterial("__pf_doorPanelMat", scene);

      // Wood-like procedural texture
      const tex = new DynamicTexture("__pf_woodTex", 128, scene, false);
      const ctx = tex.getContext();
      ctx.fillStyle = "#6b4226";
      ctx.fillRect(0, 0, 128, 128);
      // Wood grain lines
      for (let y = 0; y < 128; y += 3) {
        const g = 80 + Math.floor(Math.random() * 30);
        ctx.strokeStyle = `rgba(${g},${g - 20},${g - 40},0.4)`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, y + Math.random() * 2);
        ctx.lineTo(128, y + Math.random() * 2);
        ctx.stroke();
      }
      tex.update();

      mat.diffuseTexture = tex;
      mat.specularColor = new Color3(0.15, 0.1, 0.05);
      mat.emissiveColor = new Color3(0.02, 0.01, 0.005);
      mat.backFaceCulling = false;
    }
    return mat;
  }

  /** Create a wall-box mesh directly in world space using VertexData (no transforms). */
  function createWallBoxMesh(
    name: string,
    p0: Vector3,
    p1: Vector3,
    y0: number,
    y1: number,
    thickness: number,
    material: StandardMaterial
  ): Mesh {
    const dx = p1.x - p0.x;
    const dz = p1.z - p0.z;
    const len = Math.sqrt(dx * dx + dz * dz);
    const halfT = thickness / 2;
    const perpX = len > 0.001 ? (-dz / len) * halfT : halfT;
    const perpZ = len > 0.001 ? (dx / len) * halfT : 0;

    const positions = new Float32Array([
      p0.x - perpX,
      y0,
      p0.z - perpZ,
      p0.x + perpX,
      y0,
      p0.z + perpZ,
      p1.x + perpX,
      y0,
      p1.z + perpZ,
      p1.x - perpX,
      y0,
      p1.z - perpZ,
      p0.x - perpX,
      y1,
      p0.z - perpZ,
      p0.x + perpX,
      y1,
      p0.z + perpZ,
      p1.x + perpX,
      y1,
      p1.z + perpZ,
      p1.x - perpX,
      y1,
      p1.z - perpZ,
    ]);
    const indices = new Uint32Array([
      0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 2, 3, 7, 2, 7, 6, 0, 4, 7, 0, 7, 3, 1,
      2, 6, 1, 6, 5,
    ]);
    const normals = new Float32Array(24);
    VertexData.ComputeNormals(positions, indices, normals);

    const vd = new VertexData();
    vd.positions = positions;
    vd.indices = indices;
    vd.normals = normals;

    const mesh = new Mesh(name, scene);
    vd.applyToMesh(mesh);
    mesh.material = material;
    mesh.isPickable = false;
    mesh.computeWorldMatrix(true);
    return mesh;
  }

  function registerObstacle(
    id: string,
    meshes: Mesh[],
    info: ObstacleInfo,
    visuals: Mesh[] = []
  ): void {
    for (const m of meshes) allMeshes.push(m);
    obstacles.set(id, { meshes, visuals, info });
    console.log(
      `[Pathfinding] registerObstacle "${id}": ${meshes.length} mesh(es), navMeshBuilt=${navMeshBuilt}, totalMeshes=${allMeshes.length}`
    );
    if (navMeshBuilt) {
      showDebugNavMesh(false);
      buildNavMesh();
      tryComputePath();
    }
  }

  // --- Obstacle API ---

  function addObstacle(
    pos: Vector3,
    size: { w: number; h: number; d: number } = { w: 1.5, h: 2.5, d: 1.5 }
  ): string {
    const id = `obstacle_${++obstacleCounter}`;

    const mesh = MeshBuilder.CreateBox(
      `__pf_${id}`,
      {
        width: size.w,
        height: size.h,
        depth: size.d,
      },
      scene
    );
    mesh.position = new Vector3(pos.x, pos.y + size.h / 2, pos.z);
    mesh.material = getOrCreateObstacleMat();
    mesh.isPickable = false;
    mesh.computeWorldMatrix(true);
    mesh.bakeCurrentTransformIntoVertices();

    registerObstacle(id, [mesh], {
      id,
      type: "box",
      position: { x: pos.x, y: pos.y, z: pos.z },
      size,
    });
    return id;
  }

  function addWall(from: Vector3, to: Vector3, height = 3.0, thickness = 0.25): string {
    const id = `wall_${++obstacleCounter}`;
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.01) return id;

    // Extend wall 0.2m below the click point to ensure solid overlap
    // with floor slab geometry in Recast heightfield voxelization
    const mesh = createWallBoxMesh(
      `__pf_${id}`,
      from,
      to,
      from.y - 0.2,
      from.y + height,
      thickness,
      getOrCreateWallMat()
    );

    const cx = (from.x + to.x) / 2;
    const cz = (from.z + to.z) / 2;
    registerObstacle(id, [mesh], {
      id,
      type: "wall",
      position: { x: cx, y: from.y, z: cz },
      size: { w: thickness, h: height, d: len },
      from: { x: from.x, y: from.y, z: from.z },
      to: { x: to.x, y: to.y, z: to.z },
    });
    return id;
  }

  /**
   * @param doorT — door center position along the wall as ratio 0..1 (0 = from, 1 = to).
   *               Default 0.5 (center). When clicking a wall, this is computed from the hit point.
   */
  function addWallWithDoor(
    from: Vector3,
    to: Vector3,
    height = 3.0,
    thickness = 0.25,
    doorWidth = 1.0,
    doorHeight = 2.2,
    doorT = 0.5
  ): string {
    const id = `walldoor_${++obstacleCounter}`;
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.01) return id;

    // Door too wide for this wall — fallback to wall without door
    if (doorWidth >= len) return addWall(from, to, height, thickness);

    const wallMat = getOrCreateWallMat();
    const y0 = from.y;
    const y0nav = from.y - 0.2; // Extend below floor for solid Recast overlap

    // Direction unit vector along the wall
    const dirX = dx / len;
    const dirZ = dz / len;

    // Door position along the wall (clamped so door fits within wall)
    const halfDoor = doorWidth / 2;
    const minT = halfDoor / len;
    const maxT = 1 - halfDoor / len;
    const clampedT = Math.max(minT, Math.min(maxT, doorT));
    const doorCenterDist = clampedT * len;

    // Left wall: from → doorLeft
    const doorLeftX = from.x + dirX * (doorCenterDist - halfDoor);
    const doorLeftZ = from.z + dirZ * (doorCenterDist - halfDoor);
    const doorLeft = new Vector3(doorLeftX, y0, doorLeftZ);

    // Right wall: doorRight → to
    const doorRightX = from.x + dirX * (doorCenterDist + halfDoor);
    const doorRightZ = from.z + dirZ * (doorCenterDist + halfDoor);
    const doorRight = new Vector3(doorRightX, y0, doorRightZ);

    const meshes: Mesh[] = [];

    // Left section (full height) — y0nav extends below floor for NavMesh
    const leftLen = doorCenterDist - halfDoor;
    if (leftLen > 0.05) {
      meshes.push(
        createWallBoxMesh(`__pf_${id}_L`, from, doorLeft, y0nav, y0 + height, thickness, wallMat)
      );
    }

    // Right section (full height)
    const rightLen = len - (doorCenterDist + halfDoor);
    if (rightLen > 0.05) {
      meshes.push(
        createWallBoxMesh(`__pf_${id}_R`, doorRight, to, y0nav, y0 + height, thickness, wallMat)
      );
    }

    // Lintel above door (doorLeft → doorRight, from doorHeight to wallHeight)
    const clampedDoorH = Math.min(doorHeight, height);
    if (clampedDoorH < height - 0.05) {
      meshes.push(
        createWallBoxMesh(
          `__pf_${id}_T`,
          doorLeft,
          doorRight,
          y0 + clampedDoorH,
          y0 + height,
          thickness,
          wallMat
        )
      );
    }

    // --- Visual-only door meshes (not in NavMesh) ---
    const visuals: Mesh[] = [];
    const frameMat = getOrCreateDoorFrameMat();
    const panelMat = getOrCreateDoorPanelMat();
    const frameW = 0.06; // frame profile width
    const perpX = -dz / len;
    const perpZ = dx / len;

    // Door frame — two side posts + top header
    // Posts: short segment along wall direction (frameW wide) at each side of door
    const postEndL = new Vector3(doorLeftX + dirX * frameW, y0, doorLeftZ + dirZ * frameW);
    const postStartR = new Vector3(doorRightX - dirX * frameW, y0, doorRightZ - dirZ * frameW);
    visuals.push(
      createWallBoxMesh(
        `__pf_${id}_FL`,
        doorLeft,
        postEndL,
        y0,
        y0 + clampedDoorH,
        thickness + frameW * 2,
        frameMat
      )
    );
    visuals.push(
      createWallBoxMesh(
        `__pf_${id}_FR`,
        postStartR,
        doorRight,
        y0,
        y0 + clampedDoorH,
        thickness + frameW * 2,
        frameMat
      )
    );
    // Top header
    visuals.push(
      createWallBoxMesh(
        `__pf_${id}_FT`,
        doorLeft,
        doorRight,
        y0 + clampedDoorH - frameW,
        y0 + clampedDoorH,
        thickness + frameW * 2,
        frameMat
      )
    );

    // Door panel — thin box, hinged on left side, open ~80°
    const panelW = doorWidth - frameW * 2;
    const panelH = clampedDoorH - frameW;
    const panelThick = 0.04;
    if (panelW > 0.1 && panelH > 0.1) {
      const panel = MeshBuilder.CreateBox(
        `__pf_${id}_panel`,
        {
          width: panelThick,
          height: panelH,
          depth: panelW,
        },
        scene
      );

      // Position: hinge at doorLeft, pivot offset
      const hingeX = doorLeftX + frameW * dirX;
      const hingeZ = doorLeftZ + frameW * dirZ;
      const openAngle = Math.PI * 0.45; // ~80°
      const angle = Math.atan2(dx, dz);
      // Panel center when open (rotated around hinge)
      const halfPanel = panelW / 2;
      const panelCX = hingeX + Math.sin(angle + openAngle) * halfPanel + perpX * panelThick * 0.5;
      const panelCZ = hingeZ + Math.cos(angle + openAngle) * halfPanel + perpZ * panelThick * 0.5;

      panel.position = new Vector3(panelCX, y0 + panelH / 2, panelCZ);
      panel.rotation.y = -(angle + openAngle);
      panel.material = panelMat;
      panel.isPickable = false;
      visuals.push(panel);
    }

    const cx = (from.x + to.x) / 2;
    const cz = (from.z + to.z) / 2;
    registerObstacle(
      id,
      meshes,
      {
        id,
        type: "wall",
        position: { x: cx, y: y0, z: cz },
        size: { w: thickness, h: height, d: len },
        from: { x: from.x, y: from.y, z: from.z },
        to: { x: to.x, y: to.y, z: to.z },
      },
      visuals
    );
    return id;
  }

  /** Click on a wall → replace it with a wall-with-door at the clicked position */
  function addDoorToWall(
    wallId: string,
    doorWidth = 1.0,
    doorHeight = 2.2,
    hitPoint?: Vector3
  ): string | null {
    const entry = obstacles.get(wallId);
    if (!entry || !entry.info.from || !entry.info.to) return null;

    const { from, to } = entry.info;
    const height = entry.info.size.h;
    const thickness = entry.info.size.w;

    // Compute doorT from hitPoint (project click onto wall line)
    let doorT = 0.5;
    if (hitPoint) {
      const fx = from.x,
        fz = from.z;
      const dx = to.x - fx,
        dz = to.z - fz;
      const len2 = dx * dx + dz * dz;
      if (len2 > 0.001) {
        doorT = ((hitPoint.x - fx) * dx + (hitPoint.z - fz) * dz) / len2;
      }
    }

    // Remove existing wall
    removeObstacle(wallId);

    // Create wall-with-door in its place
    return addWallWithDoor(
      new Vector3(from.x, from.y, from.z),
      new Vector3(to.x, to.y, to.z),
      height,
      thickness,
      doorWidth,
      doorHeight,
      doorT
    );
  }

  /** Get obstacle ID that owns a specific mesh (for pick-based identification) */
  function findObstacleByMesh(mesh: AbstractMesh): string | null {
    for (const [id, entry] of obstacles) {
      if (entry.meshes.includes(mesh as Mesh)) return id;
    }
    return null;
  }

  /** Get all wall meshes (for making them temporarily pickable) */
  function getWallMeshes(): { id: string; meshes: Mesh[] }[] {
    const result: { id: string; meshes: Mesh[] }[] = [];
    for (const [id, entry] of obstacles) {
      if (entry.info.type === "wall" && entry.info.from) {
        result.push({ id, meshes: entry.meshes });
      }
    }
    return result;
  }

  /** Get all obstacle meshes (walls + blocks, for eraser pick) */
  function getAllObstacleMeshes(): Mesh[] {
    const all: Mesh[] = [];
    for (const [, entry] of obstacles) {
      all.push(...entry.meshes, ...entry.visuals);
    }
    return all;
  }

  /** Get all wall from/to endpoints for snap */
  function getWallEndpoints(): { x: number; y: number; z: number }[] {
    const pts: { x: number; y: number; z: number }[] = [];
    for (const [, entry] of obstacles) {
      if (entry.info.from) pts.push(entry.info.from);
      if (entry.info.to) pts.push(entry.info.to);
    }
    return pts;
  }

  function removeObstacle(id: string): void {
    const entry = obstacles.get(id);
    if (!entry) return;

    for (const m of entry.meshes) {
      const idx = allMeshes.indexOf(m);
      if (idx >= 0) allMeshes.splice(idx, 1);
      m.dispose();
    }
    for (const v of entry.visuals) v.dispose();
    obstacles.delete(id);

    if (navMeshBuilt) {
      showDebugNavMesh(false);
      buildNavMesh();
      tryComputePath();
    }
  }

  function getObstacles(): ObstacleInfo[] {
    return [...obstacles.values()].map((e) => e.info);
  }

  function clearObstacles(): void {
    for (const [, entry] of obstacles) {
      for (const m of entry.meshes) {
        const idx = allMeshes.indexOf(m);
        if (idx >= 0) allMeshes.splice(idx, 1);
        m.dispose();
      }
      for (const v of entry.visuals) v.dispose();
    }
    obstacles.clear();

    if (navMeshBuilt) {
      showDebugNavMesh(false);
      buildNavMesh();
      tryComputePath();
    }
  }

  // --- Cleanup ---

  function clearPath(): void {
    stopAnimation();
    startPoint = null;
    endPoint = null;
    currentWaypoints = [];
    pathDistance = 0;
    if (startMarker) {
      startMarker.dispose();
      startMarker = null;
    }
    if (endMarker) {
      endMarker.dispose();
      endMarker = null;
    }
    if (pathLine) {
      pathLine.dispose();
      pathLine = null;
    }
    if (agentSphere) {
      agentSphere.dispose();
      agentSphere = null;
    }
  }

  function disposeFloors(): void {
    for (const [, fd] of floors) {
      if (fd.debugMesh) {
        fd.debugMesh.dispose();
        fd.debugMesh = null;
      }
      fd.plugin.dispose();
    }
    for (const m of helperMeshes) m.dispose();
    helperMeshes = [];
    floors = new Map();
    sortedFloorIds = [];
    navMeshBuilt = false;
  }

  function dispose(): void {
    clearPath();
    clearObstacles();
    disposeFloors();
    startMat?.dispose();
    startMat = null;
    endMat?.dispose();
    endMat = null;
    agentMat?.dispose();
    agentMat = null;
    pathMat?.dispose();
    pathMat = null;
    debugMat?.dispose();
    debugMat = null;
    obstacleMat?.dispose();
    obstacleMat = null;
    recastModule = null;
    initialized = false;
    walkableMeshes = [];
  }

  return {
    initialize,
    detectWalkableMeshes,
    getWalkableMeshes,
    setWalkableMeshes,
    buildNavMesh,
    isNavMeshReady,
    computePath,
    setStartPoint,
    setEndPoint,
    getStartPoint,
    getEndPoint,
    getPathDistance,
    getWaypoints,
    startAnimation,
    stopAnimation,
    isAnimating: () => animating,
    showDebugNavMesh,
    clearPath,
    addObstacle,
    addWall,
    addWallWithDoor,
    addDoorToWall,
    findObstacleByMesh,
    getWallMeshes,
    getAllObstacleMeshes,
    getWallEndpoints,
    removeObstacle,
    getObstacles,
    clearObstacles,
    dispose,
  };
}
