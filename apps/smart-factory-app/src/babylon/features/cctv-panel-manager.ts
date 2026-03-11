import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { VideoTexture } from "@babylonjs/core/Materials/Textures/videoTexture";
import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import type { Observer } from "@babylonjs/core/Misc/observable";
import type { BuildingId } from "../types";
import { BUILDINGS } from "@/config/campus-layout.config";

// --- Constants ---

/** Video screen dimensions (16:9 aspect) */
const SCREEN_WIDTH = 7;
const SCREEN_HEIGHT = 4;
const SCREEN_Y = 14; // Height above ground
const SCREEN_OFFSET_X = 0; // Lateral offset from building center

/** Header bar dimensions */
const HEADER_HEIGHT = 0.8;
const HEADER_TEX_W = 512;
const HEADER_TEX_H = 64;

/** Fallback texture dimensions */
const FALLBACK_TEX_W = 640;
const FALLBACK_TEX_H = 360;

/** Frame border thickness */
const FRAME_THICKNESS = 0.12;

// --- Types ---

interface CCTVPanelState {
  id: string;
  label: string;
  buildingId: BuildingId;
  triggerLabel?: string;
  root: TransformNode;
  screenPlane: Mesh;
  screenMaterial: StandardMaterial;
  headerPlane: Mesh;
  headerTexture: DynamicTexture;
  frameMeshes: Mesh[];
  fallbackTexture: DynamicTexture;
  videoTexture: VideoTexture | null;
  status: "idle" | "connecting" | "connected" | "failed";
}

// --- Panel Manager ---

export function createCCTVPanelManager(scene: Scene, glowLayer: GlowLayer) {
  const panels = new Map<string, CCTVPanelState>();
  let observer: Observer<Scene> | null = null;
  let time = 0;

  // Animation loop for pulse effects on frames
  observer = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    time += dt;

    for (const panel of panels.values()) {
      // Pulse the frame border based on status
      for (const frameMesh of panel.frameMeshes) {
        const mat = frameMesh.material as StandardMaterial | null;
        if (!mat) continue;

        if (panel.status === "connected") {
          // Steady green glow
          mat.emissiveColor = new Color3(0, 0.45, 0.35);
        } else if (panel.status === "connecting") {
          // Pulsing blue
          const pulse = 0.2 + 0.2 * Math.sin(time * 4);
          mat.emissiveColor = new Color3(pulse * 0.3, pulse * 0.5, pulse);
        } else if (panel.status === "failed") {
          // Dim red
          mat.emissiveColor = new Color3(0.3, 0.05, 0.05);
        } else {
          mat.emissiveColor = new Color3(0.1, 0.1, 0.15);
        }
      }
    }
  });

  /** Get world position for a building's CCTV panel */
  function getBuildingScreenPosition(buildingId: BuildingId, index: number): Vector3 {
    const building = BUILDINGS.find((b) => b.id === buildingId);
    if (!building) return new Vector3(0, SCREEN_Y, 0);

    // Position above building center, offset laterally for multiple panels
    const offsetX = index * (SCREEN_WIDTH + 1.5);
    return new Vector3(
      building.position.x + SCREEN_OFFSET_X + offsetX,
      SCREEN_Y,
      building.position.z
    );
  }

  /**
   * Create the frame border meshes around the video screen.
   * All positions are LOCAL (relative to parent TransformNode).
   */
  function createFrame(id: string, parent: TransformNode): Mesh[] {
    const meshes: Mesh[] = [];
    const hw = SCREEN_WIDTH / 2;
    const hh = (SCREEN_HEIGHT + HEADER_HEIGHT) / 2;
    const offsetY = -HEADER_HEIGHT / 2;

    const frameMat = new StandardMaterial(`cctv-frame-mat-${id}`, scene);
    frameMat.diffuseColor = new Color3(0.15, 0.15, 0.2);
    frameMat.emissiveColor = new Color3(0.1, 0.1, 0.15);
    frameMat.specularColor = Color3.Black();

    // Top bar
    const top = MeshBuilder.CreateBox(
      `cctv-frame-top-${id}`,
      {
        width: SCREEN_WIDTH + FRAME_THICKNESS * 2,
        height: FRAME_THICKNESS,
        depth: FRAME_THICKNESS,
      },
      scene
    );
    top.position = new Vector3(0, hh + offsetY + FRAME_THICKNESS / 2, 0);
    top.material = frameMat;
    top.parent = parent;
    meshes.push(top);

    // Bottom bar
    const bottom = MeshBuilder.CreateBox(
      `cctv-frame-bottom-${id}`,
      {
        width: SCREEN_WIDTH + FRAME_THICKNESS * 2,
        height: FRAME_THICKNESS,
        depth: FRAME_THICKNESS,
      },
      scene
    );
    bottom.position = new Vector3(0, -hh + offsetY - FRAME_THICKNESS / 2, 0);
    bottom.material = frameMat;
    bottom.parent = parent;
    meshes.push(bottom);

    // Left bar
    const left = MeshBuilder.CreateBox(
      `cctv-frame-left-${id}`,
      {
        width: FRAME_THICKNESS,
        height: SCREEN_HEIGHT + HEADER_HEIGHT + FRAME_THICKNESS * 2,
        depth: FRAME_THICKNESS,
      },
      scene
    );
    left.position = new Vector3(-hw - FRAME_THICKNESS / 2, offsetY, 0);
    left.material = frameMat;
    left.parent = parent;
    meshes.push(left);

    // Right bar
    const right = MeshBuilder.CreateBox(
      `cctv-frame-right-${id}`,
      {
        width: FRAME_THICKNESS,
        height: SCREEN_HEIGHT + HEADER_HEIGHT + FRAME_THICKNESS * 2,
        depth: FRAME_THICKNESS,
      },
      scene
    );
    right.position = new Vector3(hw + FRAME_THICKNESS / 2, offsetY, 0);
    right.material = frameMat;
    right.parent = parent;
    meshes.push(right);

    // Register with glow layer
    for (const m of meshes) {
      glowLayer.addIncludedOnlyMesh(m);
    }

    return meshes;
  }

  /** Draw the header label */
  function drawHeader(state: CCTVPanelState): void {
    const ctx = state.headerTexture.getContext() as unknown as CanvasRenderingContext2D;
    const w = HEADER_TEX_W;
    const h = HEADER_TEX_H;

    ctx.clearRect(0, 0, w, h);

    // Dark background
    ctx.fillStyle = "rgba(18, 18, 26, 0.95)";
    ctx.fillRect(0, 0, w, h);

    // Status dot
    const dotX = 16;
    const dotY = h / 2;
    const dotR = 6;
    ctx.beginPath();
    ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
    if (state.status === "connected") {
      ctx.fillStyle = "#00C48C";
    } else if (state.status === "connecting") {
      ctx.fillStyle = "#FFA26B";
    } else if (state.status === "failed") {
      ctx.fillStyle = "#DE4545";
    } else {
      ctx.fillStyle = "#6A6A7A";
    }
    ctx.fill();

    // Camera label
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(state.label, 32, h / 2);

    // Status text
    const statusText =
      state.status === "connected"
        ? "LIVE"
        : state.status === "connecting"
          ? "연결 중..."
          : state.status === "failed"
            ? "데모 모드"
            : "";
    ctx.textAlign = "right";
    ctx.font = "bold 18px Arial";
    ctx.fillStyle =
      state.status === "connected"
        ? "#00C48C"
        : state.status === "connecting"
          ? "#FFA26B"
          : state.status === "failed"
            ? "#DE4545"
            : "#6A6A7A";
    ctx.fillText(statusText, w - 16, h / 2);

    // Bottom separator line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h - 1);
    ctx.lineTo(w, h - 1);
    ctx.stroke();

    state.headerTexture.update();
  }

  /** Draw fallback texture (when no video) */
  function drawFallback(state: CCTVPanelState): void {
    const ctx = state.fallbackTexture.getContext() as unknown as CanvasRenderingContext2D;
    const w = FALLBACK_TEX_W;
    const h = FALLBACK_TEX_H;

    ctx.clearRect(0, 0, w, h);

    // Dark background with subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#0D0D14");
    gradient.addColorStop(1, "#151520");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Grid pattern (surveillance look)
    ctx.strokeStyle = "rgba(77, 126, 255, 0.06)";
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Camera icon (simplified)
    const cx = w / 2;
    const cy = h / 2 - 20;

    ctx.strokeStyle = "#4A4A5A";
    ctx.lineWidth = 2.5;

    // Camera body
    ctx.beginPath();
    ctx.roundRect(cx - 28, cy - 18, 56, 36, 5);
    ctx.stroke();

    // Lens
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Status text
    ctx.fillStyle = "#6A6A7A";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (state.status === "connecting") {
      ctx.fillText("WHEP 연결 중...", cx, cy + 40);
    } else {
      ctx.fillText("CCTV 미연결 — 데모 모드", cx, cy + 40);
    }

    // Trigger label (if auto-opened by anomaly)
    if (state.triggerLabel) {
      ctx.fillStyle = "#DE4545";
      ctx.font = "14px Arial";
      ctx.fillText(`⚠ ${state.triggerLabel}`, cx, cy + 65);
    }

    // Timestamp
    ctx.fillStyle = "#3A3A4A";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    const now = new Date();
    ctx.fillText(
      `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`,
      w - 16,
      h - 12
    );

    state.fallbackTexture.update();
  }

  /** Open a CCTV 3D panel */
  function openPanel(
    id: string,
    label: string,
    buildingId: BuildingId,
    triggerLabel?: string
  ): void {
    // Skip if already open
    if (panels.has(id)) return;

    const index = [...panels.values()].filter((p) => p.buildingId === buildingId).length;
    const worldPos = getBuildingScreenPosition(buildingId, index);

    // --- Root TransformNode: billboard applied here so everything rotates as one unit ---
    const root = new TransformNode(`cctv-root-${id}`, scene);
    root.position = worldPos;
    root.billboardMode = 7; // BILLBOARDMODE_ALL

    // --- Video screen plane (local position: center) ---
    const screenPlane = MeshBuilder.CreatePlane(
      `cctv-screen-${id}`,
      { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
      scene
    );
    screenPlane.position = Vector3.Zero();
    screenPlane.parent = root;

    // Fallback texture
    const fallbackTexture = new DynamicTexture(
      `cctv-fallback-${id}`,
      { width: FALLBACK_TEX_W, height: FALLBACK_TEX_H },
      scene,
      false
    );
    fallbackTexture.hasAlpha = true;

    const screenMaterial = new StandardMaterial(`cctv-screen-mat-${id}`, scene);
    screenMaterial.diffuseTexture = fallbackTexture;
    screenMaterial.emissiveTexture = fallbackTexture;
    screenMaterial.specularColor = Color3.Black();
    screenMaterial.backFaceCulling = false;
    screenPlane.material = screenMaterial;

    // --- Header plane (local position: above screen) ---
    const headerPlane = MeshBuilder.CreatePlane(
      `cctv-header-${id}`,
      { width: SCREEN_WIDTH, height: HEADER_HEIGHT },
      scene
    );
    headerPlane.position = new Vector3(0, SCREEN_HEIGHT / 2 + HEADER_HEIGHT / 2, 0);
    headerPlane.parent = root;

    const headerTexture = new DynamicTexture(
      `cctv-header-tex-${id}`,
      { width: HEADER_TEX_W, height: HEADER_TEX_H },
      scene,
      false
    );
    headerTexture.hasAlpha = true;

    const headerMat = new StandardMaterial(`cctv-header-mat-${id}`, scene);
    headerMat.diffuseTexture = headerTexture;
    headerMat.emissiveTexture = headerTexture;
    headerMat.specularColor = Color3.Black();
    headerMat.backFaceCulling = false;
    headerPlane.material = headerMat;

    // --- Frame (local positions, parented to root) ---
    const frameMeshes = createFrame(id, root);

    const state: CCTVPanelState = {
      id,
      label,
      buildingId,
      triggerLabel,
      root,
      screenPlane,
      screenMaterial,
      headerPlane,
      headerTexture,
      frameMeshes,
      fallbackTexture,
      videoTexture: null,
      status: "connecting",
    };

    panels.set(id, state);

    // Draw initial textures
    drawHeader(state);
    drawFallback(state);
  }

  /** Set the video source (HTMLVideoElement) for a panel — called when WHEP connects */
  function setVideoSource(id: string, videoElement: HTMLVideoElement): void {
    const state = panels.get(id);
    if (!state) return;

    // Create VideoTexture from the element
    const videoTexture = new VideoTexture(
      `cctv-video-${id}`,
      videoElement,
      scene,
      false, // generateMipMaps
      true, // invertY
      undefined,
      {
        autoPlay: true,
        muted: true,
        autoUpdateTexture: true,
      }
    );

    state.videoTexture = videoTexture;
    state.screenMaterial.diffuseTexture = videoTexture;
    state.screenMaterial.emissiveTexture = videoTexture;
    state.status = "connected";

    drawHeader(state);
  }

  /** Update panel status (when stream status changes) */
  function updateStatus(id: string, status: CCTVPanelState["status"]): void {
    const state = panels.get(id);
    if (!state) return;

    state.status = status;
    drawHeader(state);

    // If failed/idle, revert to fallback texture
    if (status === "failed" || status === "idle") {
      if (state.videoTexture) {
        state.videoTexture.dispose();
        state.videoTexture = null;
      }
      state.screenMaterial.diffuseTexture = state.fallbackTexture;
      state.screenMaterial.emissiveTexture = state.fallbackTexture;
      drawFallback(state);
    }
  }

  /** Close a CCTV panel */
  function closePanel(id: string): void {
    const state = panels.get(id);
    if (!state) return;

    // Dispose video texture
    if (state.videoTexture) {
      state.videoTexture.dispose();
    }
    state.fallbackTexture.dispose();
    state.headerTexture.dispose();
    // Disposing root disposes all children (screen, header, frame)
    state.root.dispose(false, true);
    panels.delete(id);
  }

  /** Close all panels */
  function closeAll(): void {
    for (const id of [...panels.keys()]) {
      closePanel(id);
    }
  }

  /** Check if a panel is open */
  function isOpen(id: string): boolean {
    return panels.has(id);
  }

  function dispose(): void {
    if (observer) {
      scene.onBeforeRenderObservable.remove(observer);
      observer = null;
    }
    closeAll();
  }

  return {
    openPanel,
    setVideoSource,
    updateStatus,
    closePanel,
    closeAll,
    isOpen,
    dispose,
  };
}
