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
import type { IFCIndices } from "../types";

const SCREEN_WIDTH = 5;
const SCREEN_HEIGHT = 3;
const HEADER_HEIGHT = 0.6;
const HEADER_TEX_W = 512;
const HEADER_TEX_H = 64;
const FALLBACK_TEX_W = 640;
const FALLBACK_TEX_H = 360;
const FRAME_THICKNESS = 0.1;

type PanelStatus = "idle" | "connecting" | "connected" | "failed";

interface CCTVPanelState {
  id: string;
  label: string;
  root: TransformNode;
  screenPlane: Mesh;
  screenMaterial: StandardMaterial;
  headerPlane: Mesh;
  headerTexture: DynamicTexture;
  frameMeshes: Mesh[];
  fallbackTexture: DynamicTexture;
  videoTexture: VideoTexture | null;
  status: PanelStatus;
}

/**
 * CCTV video panel manager for IFC viewer.
 * Creates floating 3D video panels positioned by storey.
 */
export function createIFCCCTVManager(scene: Scene, glowLayer: GlowLayer, indices: IFCIndices) {
  const panels = new Map<string, CCTVPanelState>();
  let observer: Observer<Scene> | null = null;
  let time = 0;

  observer = scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime() / 1000;
    time += dt;

    for (const panel of panels.values()) {
      for (const frameMesh of panel.frameMeshes) {
        const mat = frameMesh.material as StandardMaterial | null;
        if (!mat) continue;

        if (panel.status === "connected") {
          mat.emissiveColor = new Color3(0, 0.45, 0.35);
        } else if (panel.status === "connecting") {
          const pulse = 0.2 + 0.2 * Math.sin(time * 4);
          mat.emissiveColor = new Color3(pulse * 0.3, pulse * 0.5, pulse);
        } else if (panel.status === "failed") {
          mat.emissiveColor = new Color3(0.3, 0.05, 0.05);
        } else {
          mat.emissiveColor = new Color3(0.1, 0.1, 0.15);
        }
      }
    }
  });

  function getStoreyPosition(storeyId: number): Vector3 {
    const meshes = indices.storeyMeshes.get(storeyId);
    if (!meshes || meshes.length === 0) return new Vector3(0, 10, 0);

    let sumX = 0,
      _sumY = 0,
      sumZ = 0,
      maxY = -Infinity;
    let count = 0;
    for (const mesh of meshes) {
      if (!mesh.isEnabled()) continue;
      const bounds = mesh.getBoundingInfo().boundingBox;
      const center = bounds.centerWorld;
      sumX += center.x;
      _sumY += center.y;
      sumZ += center.z;
      if (bounds.maximumWorld.y > maxY) maxY = bounds.maximumWorld.y;
      count++;
    }

    if (count === 0) return new Vector3(0, 10, 0);
    return new Vector3(sumX / count, maxY + 3, sumZ / count);
  }

  function createFrame(id: string, parent: TransformNode): Mesh[] {
    const meshes: Mesh[] = [];
    const hw = SCREEN_WIDTH / 2;
    const hh = (SCREEN_HEIGHT + HEADER_HEIGHT) / 2;
    const offsetY = -HEADER_HEIGHT / 2;

    const frameMat = new StandardMaterial(`ifc-cctv-frame-mat-${id}`, scene);
    frameMat.diffuseColor = new Color3(0.15, 0.15, 0.2);
    frameMat.emissiveColor = new Color3(0.1, 0.1, 0.15);
    frameMat.specularColor = Color3.Black();

    const positions = [
      {
        name: "top",
        w: SCREEN_WIDTH + FRAME_THICKNESS * 2,
        h: FRAME_THICKNESS,
        x: 0,
        y: hh + offsetY + FRAME_THICKNESS / 2,
      },
      {
        name: "bottom",
        w: SCREEN_WIDTH + FRAME_THICKNESS * 2,
        h: FRAME_THICKNESS,
        x: 0,
        y: -hh + offsetY - FRAME_THICKNESS / 2,
      },
      {
        name: "left",
        w: FRAME_THICKNESS,
        h: SCREEN_HEIGHT + HEADER_HEIGHT + FRAME_THICKNESS * 2,
        x: -hw - FRAME_THICKNESS / 2,
        y: offsetY,
      },
      {
        name: "right",
        w: FRAME_THICKNESS,
        h: SCREEN_HEIGHT + HEADER_HEIGHT + FRAME_THICKNESS * 2,
        x: hw + FRAME_THICKNESS / 2,
        y: offsetY,
      },
    ];

    for (const pos of positions) {
      const bar = MeshBuilder.CreateBox(
        `ifc-cctv-frame-${pos.name}-${id}`,
        {
          width: pos.w,
          height: pos.h,
          depth: FRAME_THICKNESS,
        },
        scene
      );
      bar.position = new Vector3(pos.x, pos.y, 0);
      bar.material = frameMat;
      bar.parent = parent;
      glowLayer.addIncludedOnlyMesh(bar);
      meshes.push(bar);
    }

    return meshes;
  }

  function drawHeader(state: CCTVPanelState): void {
    const ctx = state.headerTexture.getContext() as unknown as CanvasRenderingContext2D;
    const w = HEADER_TEX_W;
    const h = HEADER_TEX_H;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "rgba(18, 18, 26, 0.95)";
    ctx.fillRect(0, 0, w, h);

    // Status dot
    ctx.beginPath();
    ctx.arc(16, h / 2, 6, 0, Math.PI * 2);
    ctx.fillStyle =
      state.status === "connected"
        ? "#00C48C"
        : state.status === "connecting"
          ? "#FFA26B"
          : state.status === "failed"
            ? "#DE4545"
            : "#6A6A7A";
    ctx.fill();

    // Label
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

    state.headerTexture.update();
  }

  function drawFallback(state: CCTVPanelState): void {
    const ctx = state.fallbackTexture.getContext() as unknown as CanvasRenderingContext2D;
    const w = FALLBACK_TEX_W;
    const h = FALLBACK_TEX_H;

    ctx.clearRect(0, 0, w, h);

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#0D0D14");
    gradient.addColorStop(1, "#151520");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "rgba(77, 126, 255, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Camera icon
    const cx = w / 2;
    const cy = h / 2 - 20;
    ctx.strokeStyle = "#4A4A5A";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(cx - 28, cy - 18, 56, 36, 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#6A6A7A";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CCTV 미연결 — 데모 모드", cx, cy + 40);

    state.fallbackTexture.update();
  }

  function openPanel(id: string, label: string, storeyId: number): void {
    if (panels.has(id)) return;

    const worldPos = getStoreyPosition(storeyId);

    const root = new TransformNode(`ifc-cctv-root-${id}`, scene);
    root.position = worldPos;
    root.billboardMode = 7;

    const screenPlane = MeshBuilder.CreatePlane(
      `ifc-cctv-screen-${id}`,
      { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
      scene
    );
    screenPlane.position = Vector3.Zero();
    screenPlane.parent = root;

    const fallbackTexture = new DynamicTexture(
      `ifc-cctv-fallback-${id}`,
      { width: FALLBACK_TEX_W, height: FALLBACK_TEX_H },
      scene,
      false
    );
    fallbackTexture.hasAlpha = true;

    const screenMaterial = new StandardMaterial(`ifc-cctv-screen-mat-${id}`, scene);
    screenMaterial.diffuseTexture = fallbackTexture;
    screenMaterial.emissiveTexture = fallbackTexture;
    screenMaterial.specularColor = Color3.Black();
    screenMaterial.backFaceCulling = false;
    screenPlane.material = screenMaterial;

    const headerPlane = MeshBuilder.CreatePlane(
      `ifc-cctv-header-${id}`,
      { width: SCREEN_WIDTH, height: HEADER_HEIGHT },
      scene
    );
    headerPlane.position = new Vector3(0, SCREEN_HEIGHT / 2 + HEADER_HEIGHT / 2, 0);
    headerPlane.parent = root;

    const headerTexture = new DynamicTexture(
      `ifc-cctv-header-tex-${id}`,
      { width: HEADER_TEX_W, height: HEADER_TEX_H },
      scene,
      false
    );
    headerTexture.hasAlpha = true;

    const headerMat = new StandardMaterial(`ifc-cctv-header-mat-${id}`, scene);
    headerMat.diffuseTexture = headerTexture;
    headerMat.emissiveTexture = headerTexture;
    headerMat.specularColor = Color3.Black();
    headerMat.backFaceCulling = false;
    headerPlane.material = headerMat;

    const frameMeshes = createFrame(id, root);

    const state: CCTVPanelState = {
      id,
      label,
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
    drawHeader(state);
    drawFallback(state);
  }

  function setVideoSource(id: string, videoElement: HTMLVideoElement): void {
    const state = panels.get(id);
    if (!state) return;

    const videoTexture = new VideoTexture(
      `ifc-cctv-video-${id}`,
      videoElement,
      scene,
      false,
      true,
      undefined,
      { autoPlay: true, muted: true, autoUpdateTexture: true }
    );

    state.videoTexture = videoTexture;
    state.screenMaterial.diffuseTexture = videoTexture;
    state.screenMaterial.emissiveTexture = videoTexture;
    state.status = "connected";
    drawHeader(state);
  }

  function updateStatus(id: string, status: PanelStatus): void {
    const state = panels.get(id);
    if (!state) return;

    state.status = status;
    drawHeader(state);

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

  function closePanel(id: string): void {
    const state = panels.get(id);
    if (!state) return;

    if (state.videoTexture) state.videoTexture.dispose();
    state.fallbackTexture.dispose();
    state.headerTexture.dispose();
    state.root.dispose(false, true);
    panels.delete(id);
  }

  function closeAll(): void {
    for (const id of [...panels.keys()]) {
      closePanel(id);
    }
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
    dispose,
  };
}
