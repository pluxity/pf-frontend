import type { Scene } from "@babylonjs/core/scene";
import type { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";

import type { ModelTier, PFModelMeta, PFDiscipline, UnifiedIndex, UnifiedTreeNode } from "../types";
import { parsePFNodeName } from "./pf-node-parser";

/**
 * Build unified indices from loaded meshes + optional metadata.
 * Adapts behavior based on detected tier.
 */
export function buildUnifiedIndex(
  meshes: AbstractMesh[],
  scene: Scene,
  metadata: PFModelMeta | null,
  tier: ModelTier
): UnifiedIndex {
  const nodeByName = new Map<string, AbstractMesh | TransformNode>();
  const storeyNodes = new Map<string, TransformNode>();
  const systemNodes = new Map<string, TransformNode>();
  const equipmentNodes = new Map<string, AbstractMesh | TransformNode>();
  const disciplineNodes = new Map<PFDiscipline, (AbstractMesh | TransformNode)[]>();

  // Index all meshes and transform nodes by name
  for (const mesh of meshes) {
    if (mesh.name) nodeByName.set(mesh.name, mesh);
  }
  for (const tn of scene.transformNodes) {
    if (tn.name && !nodeByName.has(tn.name)) {
      nodeByName.set(tn.name, tn);
    }
  }

  // For Tier 1+: Parse pf: node names and index by category
  if (tier >= 1) {
    for (const [name, node] of nodeByName) {
      const parsed = parsePFNodeName(name);
      if (!parsed) continue;

      switch (parsed.category) {
        case "storey":
          storeyNodes.set(parsed.id, node as TransformNode);
          break;
        case "sys":
          systemNodes.set(parsed.id, node as TransformNode);
          break;
        case "eq":
          equipmentNodes.set(parsed.id, node);
          break;
      }

      if (parsed.discipline) {
        let list = disciplineNodes.get(parsed.discipline);
        if (!list) {
          list = [];
          disciplineNodes.set(parsed.discipline, list);
        }
        list.push(node);
      }
    }
  }

  // For Tier 2: Also index equipment from metadata
  if (tier === 2 && metadata) {
    for (const [eqId, eqDef] of Object.entries(metadata.equipment)) {
      const node = nodeByName.get(eqDef.nodeName);
      if (node) equipmentNodes.set(eqId, node);
    }
    for (const [sysId, sysDef] of Object.entries(metadata.systems)) {
      const node = nodeByName.get(sysDef.nodeName);
      if (node) systemNodes.set(sysId, node as TransformNode);
    }
  }

  // Build tree
  const tree = buildTree(meshes, scene, tier);
  logTree(tree);

  return {
    allMeshes: meshes,
    tree,
    storeyNodes,
    systemNodes,
    equipmentNodes,
    disciplineNodes,
    nodeByName,
  };
}

// ---------------------------------------------------------------------------
// Tree building
// ---------------------------------------------------------------------------

function buildTree(meshes: AbstractMesh[], scene: Scene, tier: ModelTier): UnifiedTreeNode[] {
  if (tier === 0) {
    return buildRawMeshTree(meshes, scene);
  }
  return buildPFTree(meshes, scene);
}

/**
 * Tier 0: Build a hierarchical tree from the GLB scene graph.
 * Includes both TransformNodes (groups) and Meshes to preserve the original hierarchy.
 */
function buildRawMeshTree(meshes: AbstractMesh[], scene?: Scene): UnifiedTreeNode[] {
  const SKIP = new Set(["Hemi Light", "default light"]);

  // Collect all scene graph nodes: TransformNodes + Meshes
  type SceneNode = AbstractMesh | TransformNode;
  const nodeById = new Map<number, SceneNode>();

  if (scene) {
    for (const tn of scene.transformNodes) {
      if (SKIP.has(tn.name)) continue;
      nodeById.set(tn.uniqueId, tn);
    }
  }
  for (const m of meshes) {
    if (SKIP.has(m.name)) continue;
    nodeById.set(m.uniqueId, m);
  }

  // Build parent → children map following Babylon.js scene graph
  const childrenMap = new Map<number, SceneNode[]>();
  const roots: SceneNode[] = [];

  for (const [, node] of nodeById) {
    const parent = node.parent;
    if (parent && nodeById.has(parent.uniqueId)) {
      let siblings = childrenMap.get(parent.uniqueId);
      if (!siblings) {
        siblings = [];
        childrenMap.set(parent.uniqueId, siblings);
      }
      siblings.push(node);
    } else {
      roots.push(node);
    }
  }

  function isMesh(node: SceneNode): node is AbstractMesh {
    return "getTotalIndices" in node;
  }

  function toNode(node: SceneNode): UnifiedTreeNode {
    const kids = childrenMap.get(node.uniqueId) ?? [];
    const childNodes = kids.map(toNode);
    const ownTris = isMesh(node) ? countTriangles(node) : 0;
    const ownMesh = isMesh(node) && node.getTotalVertices() > 0 ? 1 : 0;
    const childTris = childNodes.reduce((s, c) => s + c.triangleCount, 0);
    const childMeshCount = childNodes.reduce((s, c) => s + c.meshCount, 0);

    return {
      id: node.uniqueId.toString(),
      label: node.name || (isMesh(node) ? `Mesh_${node.uniqueId}` : `Node_${node.uniqueId}`),
      pfNode: parsePFNodeName(node.name),
      node,
      children: childNodes,
      visible: isMesh(node) ? node.isEnabled() : true,
      meshCount: ownMesh + childMeshCount,
      triangleCount: ownTris + childTris,
    };
  }

  return roots.map(toNode);
}

/** Convert a single mesh into a leaf tree node (used by PF tree for orphan meshes). */
function meshToTreeNode(mesh: AbstractMesh): UnifiedTreeNode {
  return {
    id: mesh.uniqueId.toString(),
    label: mesh.name || `Mesh_${mesh.uniqueId}`,
    pfNode: parsePFNodeName(mesh.name),
    node: mesh,
    children: [],
    visible: mesh.isEnabled(),
    meshCount: 1,
    triangleCount: countTriangles(mesh),
  };
}

/**
 * Tier 1+: Build tree from pf: node hierarchy.
 */
function buildPFTree(meshes: AbstractMesh[], scene: Scene): UnifiedTreeNode[] {
  // Collect all pf: nodes in order (site -> bldg -> storey -> space -> sys -> eq -> grp)
  const pfNodes: Map<
    string,
    { node: AbstractMesh | TransformNode; parsed: ReturnType<typeof parsePFNodeName> }
  > = new Map();

  // Check transform nodes first (they form the hierarchy)
  for (const tn of scene.transformNodes) {
    const parsed = parsePFNodeName(tn.name);
    if (parsed) pfNodes.set(tn.name, { node: tn, parsed });
  }
  // Then meshes
  for (const mesh of meshes) {
    const parsed = parsePFNodeName(mesh.name);
    if (parsed && !pfNodes.has(mesh.name)) {
      pfNodes.set(mesh.name, { node: mesh, parsed });
    }
  }

  if (pfNodes.size === 0) {
    // Fallback to raw tree
    return buildRawMeshTree(meshes);
  }

  // Build tree by following Babylon.js parent-child relationships
  const roots: UnifiedTreeNode[] = [];
  const visited = new Set<string>();

  // Find root pf: nodes (those whose parent is not a pf: node)
  for (const [name, { node, parsed }] of pfNodes) {
    if (!parsed) continue;
    const parentIsPF = node.parent ? pfNodes.has(node.parent.name) : false;
    if (!parentIsPF) {
      const treeNode = buildPFSubtree(name, pfNodes, visited);
      if (treeNode) roots.push(treeNode);
    }
  }

  // Add non-pf meshes that aren't already under a pf: parent
  const orphanMeshes = meshes.filter(
    (m) => !pfNodes.has(m.name) && !visited.has(m.name) && m.getTotalVertices() > 0
  );
  if (orphanMeshes.length > 0) {
    roots.push({
      id: "__other__",
      label: "Other Meshes",
      pfNode: null,
      node: null,
      children: orphanMeshes.map((m) => meshToTreeNode(m)),
      visible: true,
      meshCount: orphanMeshes.length,
      triangleCount: orphanMeshes.reduce((s, m) => s + countTriangles(m), 0),
    });
  }

  return roots;
}

function buildPFSubtree(
  name: string,
  allNodes: Map<
    string,
    { node: AbstractMesh | TransformNode; parsed: ReturnType<typeof parsePFNodeName> }
  >,
  visited: Set<string>
): UnifiedTreeNode | null {
  if (visited.has(name)) return null;
  visited.add(name);

  const entry = allNodes.get(name);
  if (!entry?.parsed) return null;

  const { node, parsed } = entry;
  const children: UnifiedTreeNode[] = [];

  // Find children: pf: nodes recursively, non-pf meshes as leaves
  const childNodes = node.getChildren();
  for (const child of childNodes) {
    if (allNodes.has(child.name)) {
      const childTree = buildPFSubtree(child.name, allNodes, visited);
      if (childTree) children.push(childTree);
    } else if ("getTotalVertices" in child) {
      // Non-pf mesh child — include as leaf node under this pf: parent
      const mesh = child as AbstractMesh;
      if (mesh.getTotalVertices() > 0) {
        visited.add(child.name);
        children.push(meshToTreeNode(mesh));
      }
    }
  }

  // Count this node's own mesh contribution
  const ownTris = "getTotalIndices" in node ? countTriangles(node as AbstractMesh) : 0;
  const childMeshCount = children.reduce((s, c) => s + c.meshCount, 0);
  const childTriCount = children.reduce((s, c) => s + c.triangleCount, 0);

  // Build label from category and id
  const categoryLabels: Record<string, string> = {
    site: "Site",
    bldg: "Building",
    storey: "Floor",
    space: "Space",
    sys: "System",
    eq: "Equipment",
    grp: "Group",
  };
  const prefix = categoryLabels[parsed.category] ?? parsed.category;
  const disciplineSuffix = parsed.discipline ? ` [${parsed.discipline.toUpperCase()}]` : "";
  const label = `${prefix}: ${parsed.id}${disciplineSuffix}`;

  return {
    id: name,
    label,
    pfNode: parsed,
    node,
    children,
    visible: "isEnabled" in node ? (node as AbstractMesh).isEnabled() : true,
    meshCount: ("getTotalVertices" in node ? 1 : 0) + childMeshCount,
    triangleCount: ownTris + childTriCount,
  };
}

function countTriangles(mesh: AbstractMesh): number {
  return Math.floor(mesh.getTotalIndices() / 3);
}

// ---------------------------------------------------------------------------
// Debug logging
// ---------------------------------------------------------------------------

function logTree(tree: UnifiedTreeNode[]): void {
  if (tree.length === 0) return;

  const lines: string[] = ["[UnifiedIndex] Scene hierarchy:"];

  function walk(node: UnifiedTreeNode, prefix: string, isLast: boolean): void {
    const connector = isLast ? "└── " : "├── ";
    const meta =
      node.meshCount > 0 ? ` (${node.meshCount} mesh, ${formatTris(node.triangleCount)})` : "";
    lines.push(`${prefix}${connector}${node.label}${meta}`);

    const childPrefix = prefix + (isLast ? "    " : "│   ");
    for (let i = 0; i < node.children.length; i++) {
      walk(node.children[i]!, childPrefix, i === node.children.length - 1);
    }
  }

  for (let i = 0; i < tree.length; i++) {
    walk(tree[i]!, "", i === tree.length - 1);
  }

  console.log(lines.join("\n"));
}

function formatTris(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M tris`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K tris`;
  return `${n} tris`;
}
