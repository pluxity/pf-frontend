import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

import { buildUnifiedIndex } from "../loaders/unified-index-builder";
import type { UnifiedModelResult, ModelStats } from "../types";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const FLOORS = 5;
const FLOOR_HEIGHT = 3.5;
const BUILDING_W = 20;
const BUILDING_D = 16;
const SLAB_THICK = 0.15;
const WALL_THICK = 0.25;
const WALL_HEIGHT = 3.0;

// Stair config
const STAIR_X = 7;
const STAIR_Z = 5;
const STAIR_WIDTH = 1.5;
const STEPS_PER_FLOOR = 18;
const STEP_HEIGHT = FLOOR_HEIGHT / STEPS_PER_FLOOR;
const STEP_DEPTH = 0.28;

// Stairwell hole (computed from stair footprint + margin)
const STAIR_DEPTH_TOTAL = STEPS_PER_FLOOR * STEP_DEPTH;
const STAIR_START_Z = STAIR_Z - STAIR_DEPTH_TOTAL / 2;
const HOLE_MARGIN = 0.2;
const HOLE_MIN_X = STAIR_X - STAIR_WIDTH / 2 - HOLE_MARGIN;
const HOLE_MAX_X = STAIR_X + STAIR_WIDTH / 2 + HOLE_MARGIN;
const HOLE_MIN_Z = STAIR_START_Z - HOLE_MARGIN;
const HOLE_MAX_Z = STAIR_START_Z + STAIR_DEPTH_TOTAL + HOLE_MARGIN;

// Elevator config
const EV_X = -7;
const EV_Z = -5;
const EV_WIDTH = 2.0;
const EV_DEPTH = 2.0;

// Elevator shaft hole (computed from EV footprint + margin)
const EV_HOLE_MIN_X = EV_X - EV_WIDTH / 2 - HOLE_MARGIN;
const EV_HOLE_MAX_X = EV_X + EV_WIDTH / 2 + HOLE_MARGIN;
const EV_HOLE_MIN_Z = EV_Z - EV_DEPTH / 2 - HOLE_MARGIN;
const EV_HOLE_MAX_Z = EV_Z + EV_DEPTH / 2 + HOLE_MARGIN;

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function createTestBuilding(scene: Scene): UnifiedModelResult {
  const root = new TransformNode("__test_building_root", scene);
  const meshes: AbstractMesh[] = [];

  // Per-floor color palettes: [floor, wall]
  const floorPalette: [Color3, Color3][] = [
    [new Color3(0.72, 0.78, 0.68), new Color3(0.88, 0.92, 0.85)], // 1F — green
    [new Color3(0.65, 0.72, 0.85), new Color3(0.82, 0.86, 0.94)], // 2F — blue
    [new Color3(0.85, 0.75, 0.6), new Color3(0.94, 0.88, 0.78)], // 3F — orange/sand
    [new Color3(0.6, 0.8, 0.8), new Color3(0.8, 0.92, 0.92)], // 4F — teal
    [new Color3(0.78, 0.68, 0.82), new Color3(0.9, 0.84, 0.94)], // 5F — purple
  ];
  const stairMat = makeMat("stairMat", new Color3(0.7, 0.72, 0.78), scene);
  const evMat = makeMat("evMat", new Color3(0.6, 0.65, 0.7), scene);
  const roofMat = makeMat("roofMat", new Color3(0.75, 0.75, 0.73), scene);

  // PF hierarchy: site → building → storey
  const siteNode = new TransformNode("pf:site/test-site", scene);
  siteNode.parent = root;
  const bldgNode = new TransformNode("pf:bldg/test-building", scene);
  bldgNode.parent = siteNode;

  for (let f = 1; f <= FLOORS; f++) {
    const fid = `${f}F`;
    const elev = (f - 1) * FLOOR_HEIGHT;

    // Per-floor materials
    const [floorColor, wallColor] = floorPalette[(f - 1) % floorPalette.length]!;
    const fMat = makeMat(`floorMat_${fid}`, floorColor, scene);
    const wMat = makeMat(`wallMat_${fid}`, wallColor, scene);

    // pf:storey node for hierarchy & storey filtering
    const floorNode = new TransformNode(`pf:storey/${fid}`, scene);
    floorNode.parent = bldgNode;

    // Floor slab (with stairwell hole for floors 2+ where stairs arrive from below)
    if (f > 1) {
      const slabPieces = createFloorSlabWithHole(scene, fid, elev, fMat);
      for (const piece of slabPieces) {
        piece.parent = floorNode;
        meshes.push(piece);
      }
    } else {
      const slab = MeshBuilder.CreateBox(
        `${fid}_FL`,
        {
          width: BUILDING_W,
          height: SLAB_THICK,
          depth: BUILDING_D,
        },
        scene
      );
      slab.position = new Vector3(0, elev, 0);
      slab.material = fMat;
      slab.parent = floorNode;
      meshes.push(slab);
    }

    // Outer walls (4 walls)
    const walls = createOuterWalls(scene, fid, elev, wMat);
    for (const w of walls) {
      w.parent = floorNode;
      meshes.push(w);
    }

    // Elevator landing
    const evLanding = MeshBuilder.CreateBox(
      `${fid}_EV`,
      {
        width: EV_WIDTH,
        height: SLAB_THICK,
        depth: EV_DEPTH,
      },
      scene
    );
    evLanding.position = new Vector3(EV_X, elev, EV_Z);
    evLanding.material = evMat;
    evLanding.parent = floorNode;
    meshes.push(evLanding);

    // Stairs to next floor (not on top floor)
    if (f < FLOORS) {
      const stairMesh = createStaircase(scene, fid, elev, stairMat);
      if (stairMesh) {
        stairMesh.parent = floorNode;
        meshes.push(stairMesh);
      }
    }
  }

  // Roof slab
  const rfNode = new TransformNode("pf:storey/RF", scene);
  rfNode.parent = bldgNode;
  const roof = MeshBuilder.CreateBox(
    "RF_FL",
    {
      width: BUILDING_W,
      height: SLAB_THICK,
      depth: BUILDING_D,
    },
    scene
  );
  roof.position = new Vector3(0, FLOORS * FLOOR_HEIGHT, 0);
  roof.material = roofMat;
  roof.parent = rfNode;
  meshes.push(roof);

  // Build unified index
  const index = buildUnifiedIndex(meshes, scene, null, 1);

  // Stats
  let totalTris = 0,
    totalVerts = 0;
  for (const m of meshes) {
    totalTris += Math.floor(m.getTotalIndices() / 3);
    totalVerts += m.getTotalVertices();
  }

  const stats: ModelStats = {
    meshCount: meshes.length,
    triangleCount: totalTris,
    vertexCount: totalVerts,
    materialCount: 3 + FLOORS * 2, // stair + ev + roof + per-floor (floor + wall)
    tier: 1,
    fileSize: 0,
  };

  return {
    tier: 1,
    fileName: "test-building-5F.generated",
    metadata: null,
    meshes,
    root,
    index,
    stats,
  };
}

// ---------------------------------------------------------------------------
// Outer Walls
// ---------------------------------------------------------------------------

function createOuterWalls(scene: Scene, fid: string, elev: number, mat: StandardMaterial): Mesh[] {
  const walls: Mesh[] = [];
  const cy = elev + WALL_HEIGHT / 2 + SLAB_THICK / 2;

  // North
  const wN = MeshBuilder.CreateBox(
    `${fid}_WL_N`,
    {
      width: BUILDING_W,
      height: WALL_HEIGHT,
      depth: WALL_THICK,
    },
    scene
  );
  wN.position = new Vector3(0, cy, BUILDING_D / 2);
  wN.material = mat;
  walls.push(wN);

  // South
  const wS = MeshBuilder.CreateBox(
    `${fid}_WL_S`,
    {
      width: BUILDING_W,
      height: WALL_HEIGHT,
      depth: WALL_THICK,
    },
    scene
  );
  wS.position = new Vector3(0, cy, -BUILDING_D / 2);
  wS.material = mat;
  walls.push(wS);

  // East (hidden by default for test convenience)
  const wE = MeshBuilder.CreateBox(
    `${fid}_WL_E`,
    {
      width: WALL_THICK,
      height: WALL_HEIGHT,
      depth: BUILDING_D,
    },
    scene
  );
  wE.position = new Vector3(BUILDING_W / 2, cy, 0);
  wE.material = mat;
  wE.isVisible = false;
  walls.push(wE);

  // West
  const wW = MeshBuilder.CreateBox(
    `${fid}_WL_W`,
    {
      width: WALL_THICK,
      height: WALL_HEIGHT,
      depth: BUILDING_D,
    },
    scene
  );
  wW.position = new Vector3(-BUILDING_W / 2, cy, 0);
  wW.material = mat;
  walls.push(wW);

  return walls;
}

// ---------------------------------------------------------------------------
// Staircase (individual steps merged into one mesh)
// ---------------------------------------------------------------------------

function createStaircase(
  scene: Scene,
  fid: string,
  elev: number,
  mat: StandardMaterial
): Mesh | null {
  const stepMeshes: Mesh[] = [];
  const stairStartZ = STAIR_Z - (STEPS_PER_FLOOR * STEP_DEPTH) / 2;

  for (let s = 0; s < STEPS_PER_FLOOR; s++) {
    const step = MeshBuilder.CreateBox(
      `__step_${fid}_${s}`,
      {
        width: STAIR_WIDTH,
        height: 0.05, // tread thickness
        depth: STEP_DEPTH,
      },
      scene
    );
    step.position = new Vector3(
      STAIR_X,
      elev + SLAB_THICK + s * STEP_HEIGHT + 0.025,
      stairStartZ + s * STEP_DEPTH + STEP_DEPTH / 2
    );
    stepMeshes.push(step);
  }

  const merged = Mesh.MergeMeshes(stepMeshes, true, true, undefined, false, true);
  if (!merged) return null;

  merged.name = `${fid}_ST`;
  merged.material = mat;
  return merged;
}

// ---------------------------------------------------------------------------
// Floor slab with stairwell hole
// ---------------------------------------------------------------------------

/**
 * Create floor slab with two rectangular holes: stairwell + elevator shaft.
 *
 * Step 1: split around stairwell hole → LEFT, RIGHT, NORTH, SOUTH pieces
 * Step 2: the LEFT piece contains the EV shaft hole, so split it further
 *         into LEFT-LEFT, LEFT-RIGHT, LEFT-NORTH, LEFT-SOUTH sub-pieces
 *
 * Result: 7 pieces total (4 LEFT sub-pieces + RIGHT + NORTH + SOUTH)
 */
function createFloorSlabWithHole(
  scene: Scene,
  fid: string,
  elev: number,
  mat: StandardMaterial
): Mesh[] {
  const pieces: Mesh[] = [];
  const halfW = BUILDING_W / 2;
  const halfD = BUILDING_D / 2;

  // Helper to create a slab piece if it has positive size
  function addPiece(name: string, xMin: number, xMax: number, zMin: number, zMax: number) {
    const w = xMax - xMin;
    const d = zMax - zMin;
    if (w < 0.01 || d < 0.01) return;
    const piece = MeshBuilder.CreateBox(
      name,
      {
        width: w,
        height: SLAB_THICK,
        depth: d,
      },
      scene
    );
    piece.position = new Vector3(xMin + w / 2, elev, zMin + d / 2);
    piece.material = mat;
    pieces.push(piece);
  }

  // --- Stairwell hole splits ---

  // RIGHT piece: from HOLE_MAX_X to halfW, full depth
  addPiece(`${fid}_FL_R`, HOLE_MAX_X, halfW, -halfD, halfD);

  // NORTH stair piece: between stair hole X bounds, above stair hole
  addPiece(`${fid}_FL_SN`, HOLE_MIN_X, HOLE_MAX_X, HOLE_MAX_Z, halfD);

  // SOUTH stair piece: between stair hole X bounds, below stair hole
  addPiece(`${fid}_FL_SS`, HOLE_MIN_X, HOLE_MAX_X, -halfD, HOLE_MIN_Z);

  // --- LEFT region: from -halfW to HOLE_MIN_X, full depth ---
  // This region contains the EV shaft hole, so split it into 4 sub-pieces

  const leftMinX = -halfW;
  const leftMaxX = HOLE_MIN_X;

  // LEFT-LEFT: from building left edge to EV hole left edge, full depth
  addPiece(`${fid}_FL_LL`, leftMinX, EV_HOLE_MIN_X, -halfD, halfD);

  // LEFT-RIGHT: from EV hole right edge to stair hole left edge, full depth
  addPiece(`${fid}_FL_LR`, EV_HOLE_MAX_X, leftMaxX, -halfD, halfD);

  // LEFT-NORTH: between EV hole X bounds, above EV hole
  addPiece(`${fid}_FL_LN`, EV_HOLE_MIN_X, EV_HOLE_MAX_X, EV_HOLE_MAX_Z, halfD);

  // LEFT-SOUTH: between EV hole X bounds, below EV hole
  addPiece(`${fid}_FL_LS`, EV_HOLE_MIN_X, EV_HOLE_MAX_X, -halfD, EV_HOLE_MIN_Z);

  return pieces;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMat(name: string, color: Color3, scene: Scene): StandardMaterial {
  const mat = new StandardMaterial(`__test_${name}`, scene);
  mat.diffuseColor = color;
  mat.specularColor = new Color3(0.1, 0.1, 0.1);
  mat.backFaceCulling = true;
  return mat;
}
