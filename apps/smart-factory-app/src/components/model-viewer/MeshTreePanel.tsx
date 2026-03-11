import { useState } from "react";
import type { UnifiedTreeNode } from "@/babylon/types";

interface MeshTreePanelProps {
  tree: UnifiedTreeNode[];
  onNodeClick: (node: UnifiedTreeNode) => void;
  onVisibilityToggle: (nodeId: string, visible: boolean) => void;
  selectedNodeId: string | null;
}

export function MeshTreePanel({
  tree,
  onNodeClick,
  onVisibilityToggle,
  selectedNodeId,
}: MeshTreePanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-700 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Spatial Tree
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        {tree.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-neutral-500">No nodes loaded</p>
        ) : (
          tree.map((node) => (
            <TreeItem
              key={node.id}
              node={node}
              depth={0}
              onNodeClick={onNodeClick}
              onVisibilityToggle={onVisibilityToggle}
              selectedNodeId={selectedNodeId}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface TreeItemProps {
  node: UnifiedTreeNode;
  depth: number;
  onNodeClick: (node: UnifiedTreeNode) => void;
  onVisibilityToggle: (nodeId: string, visible: boolean) => void;
  selectedNodeId: string | null;
}

function TreeItem({ node, depth, onNodeClick, onVisibilityToggle, selectedNodeId }: TreeItemProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedNodeId;

  const categoryIcon = getCategoryIcon(node.pfNode?.category ?? null);

  return (
    <div>
      <div
        className={`group flex cursor-pointer items-center gap-1 rounded px-1 py-0.5 text-xs transition-colors ${
          isSelected
            ? "bg-brand/20 text-brand"
            : node.visible
              ? "text-neutral-300 hover:bg-neutral-800"
              : "text-neutral-600 hover:bg-neutral-800"
        }`}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={() => onNodeClick(node)}
      >
        {/* Expand/Collapse arrow */}
        {hasChildren ? (
          <button
            className="flex h-4 w-4 shrink-0 items-center justify-center text-neutral-500 hover:text-neutral-300"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            <svg
              className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6 6l8 4-8 4V6z" />
            </svg>
          </button>
        ) : (
          <span className="h-4 w-4 shrink-0" />
        )}

        {/* Category icon */}
        <span
          className="shrink-0 text-[10px]"
          title={node.pfNode?.category ?? (hasChildren && node.meshCount === 0 ? "group" : "mesh")}
        >
          {categoryIcon || (hasChildren && node.triangleCount === 0 ? "\u25A1" : "\u25CB")}
        </span>

        {/* Label */}
        <span className="min-w-0 flex-1 truncate" title={node.label}>
          {node.label}
        </span>

        {/* Stats */}
        <span className="shrink-0 text-[10px] text-neutral-600">
          {node.triangleCount > 0 ? formatNumber(node.triangleCount) : ""}
        </span>

        {/* Visibility toggle */}
        <button
          className={`shrink-0 ${
            node.visible
              ? "opacity-0 group-hover:opacity-100 text-neutral-400"
              : "opacity-100 text-red-400/60"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onVisibilityToggle(node.id, !node.visible);
          }}
          title={node.visible ? "Hide" : "Show"}
        >
          {node.visible ? (
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          ) : (
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onNodeClick={onNodeClick}
              onVisibilityToggle={onVisibilityToggle}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getCategoryIcon(category: string | null): string {
  switch (category) {
    case "site":
      return "\u{1F3D7}";
    case "bldg":
      return "\u{1F3E2}";
    case "storey":
      return "\u{1F4C2}";
    case "space":
      return "\u{1F6AA}";
    case "sys":
      return "\u2699\uFE0F";
    case "eq":
      return "\u{1F527}";
    case "grp":
      return "\u25A6";
    default:
      return "\u25CB";
  }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
