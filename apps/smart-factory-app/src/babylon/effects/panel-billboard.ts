import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { DistributionPanelConfig, PowerReading, LoadLevel } from "../types";
import { LOAD_COLORS } from "@/config/campus-layout.config";

interface BillboardState {
  plane: Mesh;
  texture: DynamicTexture;
  config: DistributionPanelConfig;
  currentKw: number;
  ratedKw: number;
  level: LoadLevel;
}

const BILLBOARD_WIDTH = 1.5;
const BILLBOARD_HEIGHT = 0.8;
const TEXTURE_WIDTH = 256;
const TEXTURE_HEIGHT = 128;

/**
 * Create 3D billboard labels floating above distribution panels.
 * Uses DynamicTexture for text rendering (no @babylonjs/gui dependency).
 */
export function createPanelBillboards(
  scene: Scene,
  panels: Map<string, TransformNode>,
  panelConfigs: DistributionPanelConfig[]
) {
  const billboards = new Map<string, BillboardState>();
  let visible = true;

  for (const config of panelConfigs) {
    const panelNode = panels.get(config.id);
    if (!panelNode) continue;

    // Create floating plane
    const plane = MeshBuilder.CreatePlane(
      `billboard-${config.id}`,
      { width: BILLBOARD_WIDTH, height: BILLBOARD_HEIGHT },
      scene
    );

    // Position above the panel
    const panelPos = panelNode.position;
    plane.position.set(panelPos.x, 3.5, panelPos.z);
    plane.billboardMode = 7; // BILLBOARDMODE_ALL

    // Create dynamic texture for rendering text
    const texture = new DynamicTexture(
      `billboard-tex-${config.id}`,
      { width: TEXTURE_WIDTH, height: TEXTURE_HEIGHT },
      scene,
      false
    );
    texture.hasAlpha = true;

    const mat = new StandardMaterial(`billboard-mat-${config.id}`, scene);
    mat.diffuseTexture = texture;
    mat.emissiveTexture = texture;
    mat.specularColor = Color3.Black();
    mat.backFaceCulling = false;
    mat.useAlphaFromDiffuseTexture = true;
    plane.material = mat;

    const ratedKw = config.ratedAmps * 0.4;

    const state: BillboardState = {
      plane,
      texture,
      config,
      currentKw: 0,
      ratedKw,
      level: "normal",
    };

    billboards.set(config.id, state);
    drawBillboard(state);
  }

  function drawBillboard(state: BillboardState): void {
    // Cast to CanvasRenderingContext2D — DynamicTexture uses a real canvas context at runtime
    const ctx = state.texture.getContext() as unknown as CanvasRenderingContext2D;
    const w = TEXTURE_WIDTH;
    const h = TEXTURE_HEIGHT;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background with rounded rect
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    roundRect(ctx, 4, 4, w - 8, h - 8, 10);
    ctx.fill();

    // Border
    ctx.strokeStyle = LOAD_COLORS[state.level];
    ctx.lineWidth = 2;
    roundRect(ctx, 4, 4, w - 8, h - 8, 10);
    ctx.stroke();

    // Panel label
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(state.config.label, w / 2, 32);

    // Power reading
    ctx.font = "22px Arial";
    ctx.fillStyle = LOAD_COLORS[state.level];
    ctx.fillText(`${state.currentKw.toFixed(0)} / ${state.ratedKw.toFixed(0)} kW`, w / 2, 62);

    // Load bar background
    const barX = 20;
    const barY = 80;
    const barW = w - 40;
    const barH = 12;

    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    roundRect(ctx, barX, barY, barW, barH, 4);
    ctx.fill();

    // Load bar fill
    const fillW = Math.min(barW, barW * (state.currentKw / state.ratedKw));
    ctx.fillStyle = LOAD_COLORS[state.level];
    roundRect(ctx, barX, barY, fillW, barH, 4);
    ctx.fill();

    // Load percentage
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "11px Arial";
    ctx.textAlign = "right";
    const percent = state.ratedKw > 0 ? (state.currentKw / state.ratedKw) * 100 : 0;
    ctx.fillText(`${percent.toFixed(0)}%`, w - 20, barY + 22);

    state.texture.update();
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function updateBillboards(readings: PowerReading[]): void {
    for (const r of readings) {
      const state = billboards.get(r.panelId);
      if (!state) continue;
      state.currentKw = r.currentKw;
      state.level = r.level;
      drawBillboard(state);
    }
  }

  function setVisible(show: boolean): void {
    visible = show;
    for (const state of billboards.values()) {
      state.plane.setEnabled(show);
    }
  }

  function isVisible(): boolean {
    return visible;
  }

  function dispose(): void {
    for (const state of billboards.values()) {
      state.texture.dispose();
      state.plane.dispose();
    }
    billboards.clear();
  }

  return { updateBillboards, setVisible, isVisible, dispose };
}
