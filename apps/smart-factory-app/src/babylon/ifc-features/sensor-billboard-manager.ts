import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import type { Scene } from "@babylonjs/core/scene";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { IFCIndices, MepStatus, SensorReading } from "../types";

const BILLBOARD_WIDTH = 1.2;
const BILLBOARD_HEIGHT = 0.65;
const TEXTURE_WIDTH = 256;
const TEXTURE_HEIGHT = 128;

const STATUS_COLORS: Record<MepStatus, string> = {
  normal: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  offline: "#6B7280",
};

interface BillboardState {
  plane: Mesh;
  texture: DynamicTexture;
  material: StandardMaterial;
  expressID: number;
  label: string;
  value: number;
  unit: string;
  status: MepStatus;
  dirty: boolean;
}

/**
 * Sensor data billboard manager.
 * Creates 3D labels (DynamicTexture) floating above IFC elements
 * to display sensor readings (temperature, humidity, etc.).
 */
export function createSensorBillboardManager(scene: Scene, indices: IFCIndices) {
  const billboards = new Map<number, BillboardState>();
  let visible = true;

  function addBillboard(
    expressID: number,
    label: string,
    value: number,
    unit: string,
    status: MepStatus = "normal"
  ): void {
    if (billboards.has(expressID)) return;

    // Find the mesh to position billboard above it
    const mesh = indices.expressIdToMesh.get(expressID);
    if (!mesh) return;

    const bounds = mesh.getBoundingInfo().boundingBox;
    const center = bounds.centerWorld;

    const plane = MeshBuilder.CreatePlane(
      `sensor-bb-${expressID}`,
      { width: BILLBOARD_WIDTH, height: BILLBOARD_HEIGHT },
      scene
    );
    plane.position.set(center.x, bounds.maximumWorld.y + 1.0, center.z);
    plane.billboardMode = 7; // BILLBOARDMODE_ALL
    plane.isPickable = false;

    const texture = new DynamicTexture(
      `sensor-bb-tex-${expressID}`,
      { width: TEXTURE_WIDTH, height: TEXTURE_HEIGHT },
      scene,
      false
    );
    texture.hasAlpha = true;

    const mat = new StandardMaterial(`sensor-bb-mat-${expressID}`, scene);
    mat.diffuseTexture = texture;
    mat.emissiveTexture = texture;
    mat.specularColor = Color3.Black();
    mat.backFaceCulling = false;
    mat.useAlphaFromDiffuseTexture = true;
    plane.material = mat;

    const state: BillboardState = {
      plane,
      texture,
      material: mat,
      expressID,
      label,
      value,
      unit,
      status,
      dirty: true,
    };

    billboards.set(expressID, state);
    drawBillboard(state);
  }

  function updateValue(expressID: number, value: number, status?: MepStatus): void {
    const state = billboards.get(expressID);
    if (!state) return;

    state.value = value;
    if (status !== undefined) {
      state.status = status;
    }
    state.dirty = true;
    drawBillboard(state);
  }

  function updateFromReadings(readings: SensorReading[]): void {
    for (const r of readings) {
      const state = billboards.get(r.expressID);
      if (state) {
        state.value = r.value;
        state.status = r.status;
        state.label = r.label;
        state.unit = r.unit;
        state.dirty = true;
        drawBillboard(state);
      } else {
        addBillboard(r.expressID, r.label, r.value, r.unit, r.status);
      }
    }
  }

  function drawBillboard(state: BillboardState): void {
    const ctx = state.texture.getContext() as unknown as CanvasRenderingContext2D;
    const w = TEXTURE_WIDTH;
    const h = TEXTURE_HEIGHT;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    roundRect(ctx, 4, 4, w - 8, h - 8, 8);
    ctx.fill();

    // Border
    const borderColor = STATUS_COLORS[state.status];
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    roundRect(ctx, 4, 4, w - 8, h - 8, 8);
    ctx.stroke();

    // Status dot
    ctx.beginPath();
    ctx.arc(20, 28, 5, 0, Math.PI * 2);
    ctx.fillStyle = borderColor;
    ctx.fill();

    // Label
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(state.label, 32, 32);

    // Value (large)
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = borderColor;
    ctx.textAlign = "center";
    ctx.fillText(`${state.value.toFixed(1)}`, w / 2, 72);

    // Unit
    ctx.font = "14px Arial";
    ctx.fillStyle = "#9CA3AF";
    ctx.textAlign = "center";
    ctx.fillText(state.unit, w / 2, 96);

    state.texture.update();
    state.dirty = false;
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

  function removeBillboard(expressID: number): void {
    const state = billboards.get(expressID);
    if (!state) return;
    state.texture.dispose();
    state.material.dispose();
    state.plane.dispose();
    billboards.delete(expressID);
  }

  function dispose(): void {
    for (const state of billboards.values()) {
      state.texture.dispose();
      state.material.dispose();
      state.plane.dispose();
    }
    billboards.clear();
  }

  return {
    addBillboard,
    updateValue,
    updateFromReadings,
    setVisible,
    isVisible,
    removeBillboard,
    dispose,
  };
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
