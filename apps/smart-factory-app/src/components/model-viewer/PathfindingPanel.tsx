import { useState, useRef, useEffect } from "react";
import type { UnifiedSceneApi } from "@/babylon/types";
import { useModelViewerStore } from "@/stores/model-viewer.store";

const SNAP_THRESHOLD = 0.5; // meters

interface PathfindingPanelProps {
  sceneApi: UnifiedSceneApi | null;
}

export function PathfindingPanel({ sceneApi }: PathfindingPanelProps) {
  const {
    pathfindingMode,
    pathfindingReady,
    walkableMeshCount,
    startPoint,
    endPoint,
    pathInfo,
    isAnimating,
    showNavMeshDebug,
    obstacleCount,
    setPathfindingMode,
    setPathfindingReady,
    setWalkableMeshCount,
    setStartPoint,
    setEndPoint,
    setPathInfo,
    setIsAnimating,
    setShowNavMeshDebug,
    setObstacleCount,
  } = useModelViewerStore();

  const [speed, setSpeed] = useState(2);
  const [initializing, setInitializing] = useState(false);
  const [building, setBuilding] = useState(false);

  // Wall mode: continuous drawing with snap
  const wallStartRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const [wallStart, setWallStart] = useState<{ x: number; y: number; z: number } | null>(null);
  const [snapped, setSnapped] = useState(false);
  const [wallSegments, setWallSegments] = useState(0);

  /** Snap pos to nearest wall endpoint if within threshold */
  function snapToEndpoint(pos: { x: number; y: number; z: number }): {
    pos: { x: number; y: number; z: number };
    snapped: boolean;
  } {
    if (!sceneApi) return { pos, snapped: false };
    const endpoints = sceneApi.getWallEndpoints();
    let bestDist = SNAP_THRESHOLD;
    let bestPt = pos;
    let didSnap = false;
    for (const ep of endpoints) {
      const dx = ep.x - pos.x;
      const dz = ep.z - pos.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < bestDist) {
        bestDist = dist;
        bestPt = ep;
        didSnap = true;
      }
    }
    return { pos: bestPt, snapped: didSnap };
  }

  // Right-click to finish wall chain
  useEffect(() => {
    if (pathfindingMode !== "wall") return;
    function onContextMenu(e: MouseEvent) {
      e.preventDefault();
      wallStartRef.current = null;
      setWallStart(null);
      setSnapped(false);
      setWallSegments(0);
    }
    window.addEventListener("contextmenu", onContextMenu);
    return () => window.removeEventListener("contextmenu", onContextMenu);
  }, [pathfindingMode]);

  async function handleInitAndBuild() {
    if (!sceneApi) return;

    setBuilding(true);
    try {
      if (!sceneApi.isNavMeshReady()) {
        setInitializing(true);
        await sceneApi.initPathfinding();
        setInitializing(false);

        const walkable = sceneApi.getWalkableMeshes();
        setWalkableMeshCount(walkable.length);
      }

      const success = sceneApi.buildNavMesh();
      setPathfindingReady(success);

      if (!success) {
        console.warn("[PathfindingPanel] NavMesh build failed");
      }
    } catch (err) {
      console.error("[PathfindingPanel] Init/Build error:", err);
      setPathfindingReady(false);
    } finally {
      setBuilding(false);
      setInitializing(false);
    }
  }

  function handleModeChange(
    mode: "start" | "end" | "obstacle" | "wall" | "door" | "eraser" | null
  ) {
    const newMode = pathfindingMode === mode ? null : mode;
    setPathfindingMode(newMode);

    // Reset wall state when switching modes
    wallStartRef.current = null;
    setWallStart(null);
    setSnapped(false);
    setWallSegments(0);

    if (!sceneApi) return;

    // Clear previous pick modes
    sceneApi.clearPickCallback();
    sceneApi.clearWallPick();

    if (newMode === "obstacle") {
      sceneApi.pickNavMeshPoint((pos) => {
        sceneApi.addObstacle(pos);
        setObstacleCount(sceneApi.getObstacles().length);
        const info = sceneApi.getPathInfo();
        setPathInfo(info);
      });
    } else if (newMode === "wall") {
      setWallSegments(0);
      sceneApi.pickNavMeshPoint((pos) => {
        const { pos: snappedPos, snapped: didSnap } = snapToEndpoint(pos);
        setSnapped(didSnap);

        if (!wallStartRef.current) {
          // First click: set start
          wallStartRef.current = snappedPos;
          setWallStart(snappedPos);
        } else {
          // Create wall segment, then continue chain
          sceneApi.addWall(wallStartRef.current, snappedPos);
          setObstacleCount(sceneApi.getObstacles().length);
          const info = sceneApi.getPathInfo();
          setPathInfo(info);
          // End point becomes next start (continuous drawing)
          wallStartRef.current = snappedPos;
          setWallStart(snappedPos);
          setWallSegments((n) => n + 1);
        }
      });
    } else if (newMode === "door") {
      // Door mode: click on an existing wall to add a door at the clicked point
      sceneApi.pickWall((wallId, hitPoint) => {
        sceneApi.addDoorToWall(wallId, undefined, undefined, hitPoint);
        setObstacleCount(sceneApi.getObstacles().length);
        const info = sceneApi.getPathInfo();
        setPathInfo(info);
      });
    } else if (newMode === "eraser") {
      // Eraser mode: click on any obstacle/wall to remove it
      sceneApi.pickObstacle((id) => {
        sceneApi.removeObstacle(id);
        setObstacleCount(sceneApi.getObstacles().length);
        const info = sceneApi.getPathInfo();
        setPathInfo(info);
      });
    } else if (newMode === "start" || newMode === "end") {
      sceneApi.pickNavMeshPoint((pos) => {
        if (newMode === "start") {
          sceneApi.setPathfindingStart(pos);
          setStartPoint(pos);
        } else {
          sceneApi.setPathfindingEnd(pos);
          setEndPoint(pos);
        }
        const info = sceneApi.getPathInfo();
        setPathInfo(info);
      });
    }
  }

  function handlePlay() {
    if (!sceneApi) return;
    sceneApi.startPathAnimation(speed);
    setIsAnimating(true);
  }

  function handleStop() {
    if (!sceneApi) return;
    sceneApi.stopPathAnimation();
    setIsAnimating(false);
  }

  function handleDebugToggle() {
    if (!sceneApi) return;
    const next = !showNavMeshDebug;
    sceneApi.showNavMeshDebug(next);
    setShowNavMeshDebug(next);
  }

  function handleClear() {
    if (!sceneApi) return;
    sceneApi.clearPath();
    sceneApi.clearPickCallback();
    sceneApi.clearWallPick();
    setStartPoint(null);
    setEndPoint(null);
    setPathInfo(null);
    setIsAnimating(false);
    setPathfindingMode(null);
    wallStartRef.current = null;
    setWallStart(null);
    setSnapped(false);
    setWallSegments(0);
  }

  function handleClearObstacles() {
    if (!sceneApi) return;
    sceneApi.clearObstacles();
    setObstacleCount(0);
    const info = sceneApi.getPathInfo();
    setPathInfo(info);
  }

  function handleUndoLastObstacle() {
    if (!sceneApi) return;
    const obs = sceneApi.getObstacles();
    if (obs.length === 0) return;
    sceneApi.removeObstacle(obs[obs.length - 1]!.id);
    setObstacleCount(sceneApi.getObstacles().length);
    const info = sceneApi.getPathInfo();
    setPathInfo(info);
  }

  function handleSpeedChange(value: number) {
    setSpeed(value);
    if (isAnimating && sceneApi) {
      sceneApi.stopPathAnimation();
      sceneApi.startPathAnimation(value);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-neutral-700 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Pathfinding
        </h3>
      </div>

      <div className="space-y-3 px-3 py-2">
        {/* Build NavMesh */}
        <div className="space-y-1.5">
          <div className="text-[11px] text-neutral-400">
            Walkable:{" "}
            <span className="text-neutral-200">
              {walkableMeshCount > 0 ? `${walkableMeshCount} meshes` : "not scanned"}
            </span>
          </div>

          <button
            className="w-full rounded bg-neutral-700 px-2.5 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleInitAndBuild}
            disabled={building || initializing}
          >
            {initializing
              ? "Loading WASM..."
              : building
                ? "Building..."
                : pathfindingReady
                  ? "Rebuild NavMesh"
                  : "Build NavMesh"}
          </button>
        </div>

        {pathfindingReady && (
          <>
            {/* Click Mode */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Click Mode
              </div>
              <div className="grid grid-cols-3 gap-1">
                <ModeButton
                  label="Start"
                  active={pathfindingMode === "start"}
                  color="bg-green-600"
                  onClick={() => handleModeChange("start")}
                />
                <ModeButton
                  label="End"
                  active={pathfindingMode === "end"}
                  color="bg-red-600"
                  onClick={() => handleModeChange("end")}
                />
                <ModeButton
                  label="Wall"
                  active={pathfindingMode === "wall"}
                  color="bg-blue-600"
                  onClick={() => handleModeChange("wall")}
                />
                <ModeButton
                  label="Door"
                  active={pathfindingMode === "door"}
                  color="bg-cyan-600"
                  onClick={() => handleModeChange("door")}
                />
                <ModeButton
                  label="Block"
                  active={pathfindingMode === "obstacle"}
                  color="bg-orange-600"
                  onClick={() => handleModeChange("obstacle")}
                />
                <ModeButton
                  label="Eraser"
                  active={pathfindingMode === "eraser"}
                  color="bg-pink-600"
                  onClick={() => handleModeChange("eraser")}
                />
                <ModeButton
                  label="Off"
                  active={pathfindingMode === null}
                  color="bg-neutral-600"
                  onClick={() => handleModeChange(null)}
                />
              </div>
            </div>

            {/* Wall mode hint */}
            {pathfindingMode === "wall" && (
              <div className="space-y-1">
                <div className="rounded bg-blue-900/30 px-2 py-1.5 text-[11px] text-blue-300">
                  {wallStart ? (
                    <>
                      From: ({wallStart.x.toFixed(1)}, {wallStart.z.toFixed(1)})
                      {snapped && <span className="ml-1 text-yellow-300">[snapped]</span>}
                      <br />
                      Click next point (right-click to finish)
                    </>
                  ) : (
                    "Click to start drawing walls"
                  )}
                </div>
                {wallSegments > 0 && (
                  <div className="text-[10px] text-blue-400/70">
                    {wallSegments} segment{wallSegments > 1 ? "s" : ""} drawn
                  </div>
                )}
              </div>
            )}
            {/* Door mode hint */}
            {pathfindingMode === "door" && (
              <div className="rounded bg-cyan-900/30 px-2 py-1.5 text-[11px] text-cyan-300">
                Click on a wall to add a door
              </div>
            )}
            {/* Eraser mode hint */}
            {pathfindingMode === "eraser" && (
              <div className="rounded bg-pink-900/30 px-2 py-1.5 text-[11px] text-pink-300">
                Click on a wall or block to remove it
              </div>
            )}

            {/* Points info */}
            <div className="space-y-0.5 text-[11px]">
              <PointInfo label="Start" point={startPoint} color="text-green-400" />
              <PointInfo label="End" point={endPoint} color="text-red-400" />
            </div>

            {/* Obstacles/Walls info */}
            {obstacleCount > 0 && (
              <div className="flex items-center justify-between rounded bg-neutral-800 px-2 py-1.5">
                <span className="text-[11px] text-orange-400">
                  {obstacleCount} object{obstacleCount > 1 ? "s" : ""} placed
                </span>
                <div className="flex gap-2">
                  <button
                    className="text-[10px] text-neutral-500 hover:text-neutral-300"
                    onClick={handleUndoLastObstacle}
                  >
                    Undo
                  </button>
                  <button
                    className="text-[10px] text-neutral-500 hover:text-neutral-300"
                    onClick={handleClearObstacles}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Path info */}
            {pathInfo ? (
              <div className="rounded bg-neutral-800 px-2 py-1.5 text-[11px] text-neutral-300">
                Path: {pathInfo.distance.toFixed(1)}m, {pathInfo.waypoints} waypoints
              </div>
            ) : startPoint && endPoint ? (
              <div className="rounded bg-neutral-800 px-2 py-1.5 text-[11px] text-yellow-400">
                No path found
              </div>
            ) : null}

            {/* Animation controls */}
            {pathInfo && pathInfo.waypoints > 1 && (
              <div className="space-y-1.5">
                <button
                  className={`w-full rounded px-2 py-1 text-xs font-medium transition-colors ${
                    isAnimating
                      ? "bg-brand/20 text-brand"
                      : "bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
                  }`}
                  onClick={isAnimating ? handleStop : handlePlay}
                >
                  {isAnimating ? "Stop" : "Play"}
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-500">Speed</span>
                  <input
                    type="range"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={speed}
                    onChange={(e) => handleSpeedChange(Number(e.target.value))}
                    className="h-1 flex-1 cursor-pointer accent-brand"
                  />
                  <span className="w-6 text-right text-[10px] text-neutral-400">{speed}x</span>
                </div>
              </div>
            )}

            {/* Debug + Clear */}
            <div className="space-y-1.5 border-t border-neutral-800 pt-2">
              <label className="flex cursor-pointer items-center gap-2 text-[11px] text-neutral-400 hover:text-neutral-300">
                <input
                  type="checkbox"
                  checked={showNavMeshDebug}
                  onChange={handleDebugToggle}
                  className="accent-brand"
                />
                Show NavMesh Debug
              </label>

              <button
                className="w-full rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-neutral-200"
                onClick={handleClear}
              >
                Clear Path
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function ModeButton({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded px-1.5 py-1 text-[11px] font-medium transition-colors ${
        active ? `${color} text-white` : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function PointInfo({
  label,
  point,
  color,
}: {
  label: string;
  point: { x: number; y: number; z: number } | null;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-[10px] font-medium ${color}`}>{label}:</span>
      {point ? (
        <span className="text-neutral-400">
          ({point.x.toFixed(1)}, {point.y.toFixed(1)}, {point.z.toFixed(1)})
        </span>
      ) : (
        <span className="text-neutral-600">(click to set)</span>
      )}
    </div>
  );
}
