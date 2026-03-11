import type { IfcAPI } from "web-ifc";
import {
  IFCPROJECT,
  IFCBUILDINGSTOREY,
  IFCRELAGGREGATES,
  IFCRELCONTAINEDINSPATIALSTRUCTURE,
  IFCRELDEFINESBYPROPERTIES,
  IFCPROPERTYSET,
  IFCPROPERTYSINGLEVALUE,
} from "web-ifc";
import { classifyElement, type Discipline } from "./classifier.js";

// --- Public types ---

export interface SpatialNode {
  expressID: number;
  type: string;
  name: string;
  children: SpatialNode[];
  elementIds: number[];
}

export interface ElementMeta {
  expressID: number;
  type: string;
  name: string;
  discipline: Discipline | undefined;
  storeyId: number | null;
  properties: Record<string, string | number | boolean>;
}

export interface IFCMetadata {
  project: { name: string; description: string };
  spatialHierarchy: SpatialNode[];
  elements: Record<number, ElementMeta>; // expressID → meta (serialisable)
}

// --- Helpers ---

function getStringValue(ifcApi: IfcAPI, modelID: number, expressID: number): string {
  try {
    const line = ifcApi.GetLine(modelID, expressID);
    return (line.Name?.value as string) ?? "";
  } catch {
    return "";
  }
}

function getTypeName(ifcApi: IfcAPI, modelID: number, expressID: number): string {
  try {
    const typeId = ifcApi.GetLineType(modelID, expressID);
    return ifcApi.GetNameFromTypeCode(typeId) ?? `Unknown(${typeId})`;
  } catch {
    return "Unknown";
  }
}

// --- Spatial hierarchy ---

function buildSpatialTree(ifcApi: IfcAPI, modelID: number, rootID: number): SpatialNode {
  const typeName = getTypeName(ifcApi, modelID, rootID);
  const name = getStringValue(ifcApi, modelID, rootID);

  const node: SpatialNode = {
    expressID: rootID,
    type: typeName,
    name,
    children: [],
    elementIds: [],
  };

  // Children via IfcRelAggregates
  const aggregates = ifcApi.GetLineIDsWithType(modelID, IFCRELAGGREGATES);
  for (let i = 0; i < aggregates.size(); i++) {
    const relID = aggregates.get(i);
    const rel = ifcApi.GetLine(modelID, relID);
    if (rel.RelatingObject?.value === rootID) {
      const related = rel.RelatedObjects;
      if (Array.isArray(related)) {
        for (const child of related) {
          const childID = child.value as number;
          node.children.push(buildSpatialTree(ifcApi, modelID, childID));
        }
      }
    }
  }

  // Contained elements via IfcRelContainedInSpatialStructure
  const containment = ifcApi.GetLineIDsWithType(modelID, IFCRELCONTAINEDINSPATIALSTRUCTURE);
  for (let i = 0; i < containment.size(); i++) {
    const relID = containment.get(i);
    const rel = ifcApi.GetLine(modelID, relID);
    if (rel.RelatingStructure?.value === rootID) {
      const elements = rel.RelatedElements;
      if (Array.isArray(elements)) {
        for (const el of elements) {
          node.elementIds.push(el.value as number);
        }
      }
    }
  }

  return node;
}

// --- Element-storey mapping ---

function buildStoreyMap(ifcApi: IfcAPI, modelID: number): Map<number, number> {
  const elementToStorey = new Map<number, number>();

  const storeyIDs = ifcApi.GetLineIDsWithType(modelID, IFCBUILDINGSTOREY);
  const containment = ifcApi.GetLineIDsWithType(modelID, IFCRELCONTAINEDINSPATIALSTRUCTURE);

  for (let i = 0; i < containment.size(); i++) {
    const relID = containment.get(i);
    const rel = ifcApi.GetLine(modelID, relID);
    const structureID = rel.RelatingStructure?.value as number | undefined;
    if (structureID == null) continue;

    // Check if the relating structure is a storey
    let isStorey = false;
    for (let s = 0; s < storeyIDs.size(); s++) {
      if (storeyIDs.get(s) === structureID) {
        isStorey = true;
        break;
      }
    }
    if (!isStorey) continue;

    const elements = rel.RelatedElements;
    if (Array.isArray(elements)) {
      for (const el of elements) {
        elementToStorey.set(el.value as number, structureID);
      }
    }
  }

  return elementToStorey;
}

// --- Property sets ---

function extractProperties(
  ifcApi: IfcAPI,
  modelID: number,
  expressID: number
): Record<string, string | number | boolean> {
  const props: Record<string, string | number | boolean> = {};

  const relDefines = ifcApi.GetLineIDsWithType(modelID, IFCRELDEFINESBYPROPERTIES);

  for (let i = 0; i < relDefines.size(); i++) {
    const relID = relDefines.get(i);
    const rel = ifcApi.GetLine(modelID, relID);

    // Check if this relation references our element
    const relatedObjects = rel.RelatedObjects;
    if (!Array.isArray(relatedObjects)) continue;
    const found = relatedObjects.some((obj: { value: number }) => obj.value === expressID);
    if (!found) continue;

    const psetRef = rel.RelatingPropertyDefinition?.value;
    if (psetRef == null) continue;

    try {
      const pset = ifcApi.GetLine(modelID, psetRef);
      // Only handle IfcPropertySet (not IfcQuantitySet etc.)
      if (ifcApi.GetLineType(modelID, psetRef) !== IFCPROPERTYSET) continue;

      const properties = pset.HasProperties;
      if (!Array.isArray(properties)) continue;

      for (const propRef of properties) {
        try {
          const prop = ifcApi.GetLine(modelID, propRef.value);
          if (ifcApi.GetLineType(modelID, propRef.value) !== IFCPROPERTYSINGLEVALUE) continue;

          const name = prop.Name?.value as string;
          const nominalValue = prop.NominalValue;
          if (name && nominalValue != null) {
            const val = nominalValue.value;
            if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
              props[name] = val;
            }
          }
        } catch {
          // Skip unreadable properties
        }
      }
    } catch {
      // Skip unreadable property sets
    }
  }

  return props;
}

// --- Main extraction ---

/**
 * Extract full metadata from an IFC model:
 *   - Project info
 *   - Spatial hierarchy (Project → Site → Building → Storey)
 *   - Per-element metadata (type, discipline, storey, properties)
 *
 * @param elementIDs  Optional set of expressIDs to extract properties for.
 *                    If omitted, extracts properties for ALL elements
 *                    referenced in the spatial hierarchy.
 */
export function extractMetadata(
  ifcApi: IfcAPI,
  modelID: number,
  elementIDs?: Set<number>
): IFCMetadata {
  // 1. Project info
  const projectIDs = ifcApi.GetLineIDsWithType(modelID, IFCPROJECT);
  let projectName = "";
  let projectDescription = "";
  let rootID: number | undefined;

  if (projectIDs.size() > 0) {
    rootID = projectIDs.get(0);
    const project = ifcApi.GetLine(modelID, rootID);
    projectName = (project.Name?.value as string) ?? "";
    projectDescription = (project.Description?.value as string) ?? "";
  }

  // 2. Spatial hierarchy
  const spatialHierarchy: SpatialNode[] = [];
  if (rootID != null) {
    spatialHierarchy.push(buildSpatialTree(ifcApi, modelID, rootID));
  }

  // 3. Element-storey mapping
  const storeyMap = buildStoreyMap(ifcApi, modelID);

  // 4. Collect all element IDs from hierarchy if not provided
  const allElementIDs = elementIDs ?? collectAllElementIDs(spatialHierarchy);

  // 5. Per-element metadata
  const elements: Record<number, ElementMeta> = {};
  for (const eid of allElementIDs) {
    const typeName = getTypeName(ifcApi, modelID, eid);
    const name = getStringValue(ifcApi, modelID, eid);
    const entityType = ifcApi.GetLineType(modelID, eid);
    const discipline = classifyElement(entityType);
    const storeyId = storeyMap.get(eid) ?? null;
    const properties = extractProperties(ifcApi, modelID, eid);

    elements[eid] = {
      expressID: eid,
      type: typeName,
      name,
      discipline,
      storeyId,
      properties,
    };
  }

  return {
    project: { name: projectName, description: projectDescription },
    spatialHierarchy,
    elements,
  };
}

/** Recursively collect all element IDs from the spatial tree. */
function collectAllElementIDs(nodes: SpatialNode[]): Set<number> {
  const ids = new Set<number>();
  function walk(node: SpatialNode) {
    for (const eid of node.elementIds) ids.add(eid);
    for (const child of node.children) walk(child);
  }
  for (const root of nodes) walk(root);
  return ids;
}
