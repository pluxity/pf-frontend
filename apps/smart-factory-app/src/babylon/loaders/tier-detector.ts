import type { ModelTier, PFModelMeta } from "../types";
import { hasPFNodes } from "./pf-node-parser";

/**
 * Detect the model tier based on available data:
 *
 * - Tier 2: sidecar JSON is provided
 * - Tier 1: GLB nodes use pf: naming convention
 * - Tier 0: raw GLB with no metadata
 */
export function detectModelTier(nodeNames: string[], metadata: PFModelMeta | null): ModelTier {
  if (metadata) return 2;
  if (hasPFNodes(nodeNames)) return 1;
  return 0;
}
