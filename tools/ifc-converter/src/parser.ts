import { IfcAPI } from "web-ifc";
import fs from "node:fs";
import path from "node:path";

export interface ParsedModel {
  ifcApi: IfcAPI;
  modelID: number;
  filePath: string;
}

/**
 * Initialize web-ifc WASM and load an IFC file.
 *
 * `COORDINATE_TO_ORIGIN` shifts geometry so the bounding-box center
 * sits at (0,0,0) — essential for Babylon.js scene placement.
 */
export async function loadIFC(filePath: string): Promise<ParsedModel> {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`IFC file not found: ${resolved}`);
  }

  const ifcApi = new IfcAPI();

  // web-ifc auto-locates WASM in Node.js — no SetWasmPath needed
  await ifcApi.Init();

  const data = fs.readFileSync(resolved);
  const modelID = ifcApi.OpenModel(new Uint8Array(data.buffer), {
    COORDINATE_TO_ORIGIN: true,
    CIRCLE_SEGMENTS: 12,
  });

  return { ifcApi, modelID, filePath: resolved };
}

/**
 * Close a previously opened model and release resources.
 */
export function closeModel(parsed: ParsedModel): void {
  parsed.ifcApi.CloseModel(parsed.modelID);
}
