import { useRef, useEffect } from "react";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

import { createUnifiedScene } from "@/babylon/loaders/create-unified-scene";
import type { UnifiedSceneApi, PFElementMeta } from "@/babylon/types";
import { useModelViewerStore } from "@/stores/model-viewer.store";

import { DropZone } from "./DropZone";
import { TierBadge } from "./TierBadge";
import { MeshTreePanel } from "./MeshTreePanel";
import { PropertyPanel } from "./PropertyPanel";
import { SystemFilterPanel } from "./SystemFilterPanel";
import { ViewerToolbar } from "./ViewerToolbar";
import { PathfindingPanel } from "./PathfindingPanel";

export function ModelUploadViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneApiRef = useRef<UnifiedSceneApi | null>(null);

  const {
    isLoading,
    sceneReady,
    tier,
    tree,
    stats,
    fileName,
    selectedMesh,
    selectedElement,
    storeys,
    systems,
    storeyVisibility,
    systemVisibility,
    disciplineVisibility,
    setLoading,
    setSceneData,
    setSelectedMesh,
    setSelectedElement,
    setStoreyVisibility,
    setSystemVisibility,
    setNodeVisibility,
    setDisciplineVisibility,
    setWalkableMeshCount,
    setPathfindingReady,
    resetAll,
  } = useModelViewerStore();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sceneApiRef.current?.dispose();
      sceneApiRef.current = null;
      resetAll();
    };
  }, [resetAll]);

  async function loadScene(options: {
    glbSource?: File;
    metaSource?: File | null;
    testBuilding?: boolean;
  }) {
    sceneApiRef.current?.dispose();
    sceneApiRef.current = null;
    resetAll();
    setLoading(true);

    try {
      if (!canvasRef.current) throw new Error("Canvas not ready");

      const api = await createUnifiedScene(canvasRef.current, {
        glbSource: options.glbSource ?? new File([], "empty"),
        metaSource: options.metaSource ?? null,
        testBuilding: options.testBuilding,
      });

      sceneApiRef.current = api;

      requestAnimationFrame(() => {
        api.resize();
        api.fitCamera();
      });

      api.onSelect((mesh: AbstractMesh | null, element: PFElementMeta | null) => {
        setSelectedMesh(mesh);
        setSelectedElement(element);
      });

      setSceneData({
        tier: api.model.tier,
        tree: api.model.index.tree,
        stats: api.model.stats,
        fileName: api.model.fileName,
        storeys: api.getStoreys(),
        systems: api.getSystems(),
      });

      setWalkableMeshCount(api.getWalkableMeshes().length);
      setPathfindingReady(api.isNavMeshReady());
    } catch (err) {
      console.error("[ModelUploadViewer] Failed to load:", err);
      resetAll();
    } finally {
      setLoading(false);
    }
  }

  function handleFilesDropped(glb: File, meta: File | null) {
    loadScene({ glbSource: glb, metaSource: meta });
  }

  function handleTestBuilding() {
    loadScene({ testBuilding: true });
  }

  function handleNodeClick(node: { id: string; node: unknown }) {
    const sceneNode = node.node as AbstractMesh | null;
    if (!sceneNode) return;

    // If it's a mesh, select it directly
    if ("getTotalVertices" in sceneNode) {
      sceneApiRef.current?.selectMesh(sceneNode);
    } else if ("getChildMeshes" in sceneNode) {
      // TransformNode: select the first child mesh for camera focus
      const children = (
        sceneNode as unknown as { getChildMeshes: () => AbstractMesh[] }
      ).getChildMeshes();
      if (children.length > 0 && children[0]) {
        sceneApiRef.current?.selectMesh(children[0]);
      }
    }
  }

  function handleVisibilityToggle(nodeId: string, visible: boolean) {
    sceneApiRef.current?.setNodeVisible(nodeId, visible);
    setNodeVisibility(nodeId, visible);
  }

  function handleStoreyToggle(storeyId: string, visible: boolean) {
    sceneApiRef.current?.setStoreyVisible(storeyId, visible);
    setStoreyVisibility(storeyId, visible);
  }

  function handleSystemToggle(systemId: string, visible: boolean) {
    sceneApiRef.current?.setSystemVisible(systemId, visible);
    setSystemVisibility(systemId, visible);
  }

  function handleDisciplineToggle(disc: "arc" | "mep" | "str", visible: boolean) {
    sceneApiRef.current?.setDisciplineVisible(disc, visible);
    setDisciplineVisibility(disc, visible);
  }

  function handleIsolateStorey(storeyId: string) {
    sceneApiRef.current?.isolateStorey(storeyId);
    // Update store: only this storey visible
    for (const s of storeys) {
      setStoreyVisibility(s.id, s.id === storeyId);
    }
  }

  function handleShowAllStoreys() {
    sceneApiRef.current?.showAllStoreys();
    for (const s of storeys) {
      setStoreyVisibility(s.id, true);
    }
  }

  return (
    <div className="flex h-full flex-col bg-neutral-900 text-neutral-200">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-neutral-800 px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-neutral-100">Smart Factory - Model Viewer</h1>
          {sceneReady && tier !== null && <TierBadge tier={tier} />}
          {fileName && <span className="text-xs text-neutral-500">{fileName}</span>}
        </div>
        <div className="flex items-center gap-2">
          {sceneReady && <ViewerToolbar sceneApi={sceneApiRef.current} />}
          {sceneReady && (
            <button
              className="rounded px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
              onClick={() => {
                sceneApiRef.current?.dispose();
                sceneApiRef.current = null;
                resetAll();
              }}
            >
              Close
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex min-h-0 flex-1">
        {/* Left panel - Tree & Filters */}
        {sceneReady && (
          <div className="flex w-64 shrink-0 flex-col border-r border-neutral-800">
            <div className="flex-1 overflow-hidden">
              <MeshTreePanel
                tree={tree}
                onNodeClick={handleNodeClick}
                onVisibilityToggle={handleVisibilityToggle}
                selectedNodeId={selectedMesh?.uniqueId?.toString() ?? null}
              />
            </div>
            {tier !== null && tier >= 1 && (
              <div className="max-h-64 shrink-0 border-t border-neutral-800 overflow-y-auto">
                <SystemFilterPanel
                  tier={tier}
                  storeys={storeys}
                  systems={systems}
                  storeyVisibility={storeyVisibility}
                  systemVisibility={systemVisibility}
                  disciplineVisibility={disciplineVisibility}
                  onStoreyToggle={handleStoreyToggle}
                  onSystemToggle={handleSystemToggle}
                  onDisciplineToggle={handleDisciplineToggle}
                  onIsolateStorey={handleIsolateStorey}
                  onShowAllStoreys={handleShowAllStoreys}
                />
              </div>
            )}
            <div className="shrink-0 border-t border-neutral-800 overflow-y-auto max-h-80">
              <PathfindingPanel sceneApi={sceneApiRef.current} />
            </div>
          </div>
        )}

        {/* Canvas area */}
        <div className="relative min-w-0 flex-1">
          {/* Canvas always visible so Babylon.js Engine gets correct dimensions */}
          <canvas ref={canvasRef} className="h-full w-full" />

          {/* DropZone overlay (shown when no model loaded) */}
          {!sceneReady && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
              <DropZone onFilesDropped={handleFilesDropped} isLoading={isLoading} />
              <button
                className="mt-4 rounded border border-neutral-600 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                onClick={handleTestBuilding}
                disabled={isLoading}
              >
                Test Building (5F)
              </button>
            </div>
          )}
        </div>

        {/* Right panel - Properties */}
        {sceneReady && (
          <div className="w-56 shrink-0 border-l border-neutral-800">
            <PropertyPanel
              selectedMesh={selectedMesh}
              selectedElement={selectedElement}
              tier={tier ?? 0}
            />
          </div>
        )}
      </div>

      {/* Status bar */}
      {sceneReady && stats && (
        <footer className="flex shrink-0 items-center gap-4 border-t border-neutral-800 px-4 py-1">
          <StatusItem label="meshes" value={stats.meshCount.toLocaleString()} />
          <StatusItem label="tris" value={formatLargeNumber(stats.triangleCount)} />
          <StatusItem label="verts" value={formatLargeNumber(stats.vertexCount)} />
          <StatusItem label="materials" value={stats.materialCount.toString()} />
          <StatusItem label="tier" value={String(tier)} />
          <StatusItem label="file" value={fileName ?? ""} />
          {stats.fileSize > 0 && <StatusItem label="size" value={formatFileSize(stats.fileSize)} />}
        </footer>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-[10px] text-neutral-500">
      {label}: <span className="text-neutral-400">{value}</span>
    </span>
  );
}

function formatLargeNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
