import type { PFNodeCategory, PFDiscipline, PFNodeInfo } from "../types";

const VALID_CATEGORIES = new Set<PFNodeCategory>([
  "site",
  "bldg",
  "storey",
  "space",
  "sys",
  "eq",
  "grp",
]);

const VALID_DISCIPLINES = new Set<PFDiscipline>(["arc", "mep", "str"]);

/**
 * Parse a PF node name like `pf:storey/1F` or `pf:sys/1F-hvac:mep`.
 *
 * Pattern: `pf:{category}/{id}[:{discipline}]`
 *
 * Returns null if the name doesn't match the pf: convention.
 */
export function parsePFNodeName(name: string): PFNodeInfo | null {
  if (!name.startsWith("pf:")) return null;

  // Strip the "pf:" prefix
  const body = name.slice(3);

  // Split on first "/" to get category and remainder
  const slashIdx = body.indexOf("/");
  if (slashIdx === -1) return null;

  const category = body.slice(0, slashIdx) as PFNodeCategory;
  if (!VALID_CATEGORIES.has(category)) return null;

  let remainder = body.slice(slashIdx + 1);
  if (!remainder) return null;

  // Check for :discipline suffix
  let discipline: PFDiscipline | null = null;
  const colonIdx = remainder.lastIndexOf(":");
  if (colonIdx !== -1) {
    const suffix = remainder.slice(colonIdx + 1) as PFDiscipline;
    if (VALID_DISCIPLINES.has(suffix)) {
      discipline = suffix;
      remainder = remainder.slice(0, colonIdx);
    }
  }

  return {
    raw: name,
    category,
    id: remainder,
    discipline,
  };
}

/**
 * Check if any node in the given list has a pf: name.
 * Used for quick Tier detection.
 */
export function hasPFNodes(nodeNames: string[]): boolean {
  return nodeNames.some((n) => n.startsWith("pf:"));
}

/**
 * Extract the storey ID from a PF node path.
 * Walks up the parent chain to find the nearest pf:storey node.
 */
export function findParentStoreyId(
  nodeName: string,
  parentMap: Map<string, string>
): string | null {
  let current = nodeName;
  const visited = new Set<string>();

  while (current && !visited.has(current)) {
    visited.add(current);
    const info = parsePFNodeName(current);
    if (info?.category === "storey") return info.id;
    const parent = parentMap.get(current);
    if (!parent) break;
    current = parent;
  }

  return null;
}
