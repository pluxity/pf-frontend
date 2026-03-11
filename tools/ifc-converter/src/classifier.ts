import {
  IFCWALL,
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCDOOR,
  IFCWINDOW,
  IFCROOF,
  IFCSTAIR,
  IFCRAILING,
  IFCCURTAINWALL,
  IFCPLATE,
  IFCCOVERING,
  IFCOPENINGELEMENT,
  IFCPIPESEGMENT,
  IFCPIPEFITTING,
  IFCDUCTSEGMENT,
  IFCDUCTFITTING,
  IFCFLOWTERMINAL,
  IFCFLOWSEGMENT,
  IFCFLOWFITTING,
  IFCFLOWCONTROLLER,
  IFCCABLESEGMENT,
  IFCCABLECARRIERSEGMENT,
  IFCSANITARYTERMINAL,
  IFCAIRTERMINAL,
  IFCENERGYCONVERSIONDEVICE,
  IFCFLOWMOVINGDEVICE,
  IFCFLOWSTORAGEDEVICE,
  IFCBEAM,
  IFCCOLUMN,
  IFCMEMBER,
  IFCFOOTING,
  IFCPILE,
  IFCBUILDINGELEMENTPROXY,
} from "web-ifc";

export type Discipline = "arc" | "mep" | "str";

/** ARC — Architectural elements (walls, slabs, doors, windows, roofs, stairs…) */
const ARC_TYPES = new Set<number>([
  IFCWALL,
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCDOOR,
  IFCWINDOW,
  IFCROOF,
  IFCSTAIR,
  IFCRAILING,
  IFCCURTAINWALL,
  IFCPLATE,
  IFCCOVERING,
  IFCOPENINGELEMENT,
]);

/** MEP — Mechanical, Electrical, Plumbing (pipes, ducts, cables, terminals…) */
const MEP_TYPES = new Set<number>([
  IFCPIPESEGMENT,
  IFCPIPEFITTING,
  IFCDUCTSEGMENT,
  IFCDUCTFITTING,
  IFCFLOWTERMINAL,
  IFCFLOWSEGMENT,
  IFCFLOWFITTING,
  IFCFLOWCONTROLLER,
  IFCCABLESEGMENT,
  IFCCABLECARRIERSEGMENT,
  IFCSANITARYTERMINAL,
  IFCAIRTERMINAL,
  IFCENERGYCONVERSIONDEVICE,
  IFCFLOWMOVINGDEVICE,
  IFCFLOWSTORAGEDEVICE,
]);

/** STR — Structural elements (beams, columns, footings…) */
const STR_TYPES = new Set<number>([
  IFCBEAM,
  IFCCOLUMN,
  IFCMEMBER,
  IFCFOOTING,
  IFCPILE,
  IFCBUILDINGELEMENTPROXY,
]);

/**
 * Classify an IFC entity type into a discipline.
 * Returns `undefined` for types that don't belong to ARC / MEP / STR
 * (e.g. spatial structure elements, annotations).
 */
export function classifyElement(ifcType: number): Discipline | undefined {
  if (ARC_TYPES.has(ifcType)) return "arc";
  if (MEP_TYPES.has(ifcType)) return "mep";
  if (STR_TYPES.has(ifcType)) return "str";
  return undefined;
}

/** All discipline values for iteration */
export const ALL_DISCIPLINES: readonly Discipline[] = ["arc", "mep", "str"] as const;

/** Human-readable labels */
export const DISCIPLINE_LABELS: Record<Discipline, string> = {
  arc: "Architectural",
  mep: "MEP (Mechanical / Electrical / Plumbing)",
  str: "Structural",
};
