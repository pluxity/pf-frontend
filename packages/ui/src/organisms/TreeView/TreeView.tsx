import { useState, useCallback, type Ref } from "react";
import { ChevronRight, ChevronDown, Check, Minus } from "../../atoms/Icon";
import { Folder, File } from "../../atoms/Icon";
import { cn } from "../../utils";

export interface TreeNode {
  id: string;
  label?: string;
  render?: React.ReactNode;
  icon?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  data?: unknown;
}

export interface TreeViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  data: TreeNode[];
  defaultExpandedIds?: string[];
  expandedIds?: string[];
  onExpandedChange?: (ids: string[]) => void;
  selectedId?: string;
  onNodeSelect?: (node: TreeNode) => void;
  showIcons?: boolean;
  defaultIcon?: "folder" | "file" | "none";
  indentSize?: number;
  height?: number | string;
  showCheckbox?: boolean;
  checkedIds?: string[];
  defaultCheckedIds?: string[];
  onCheckedChange?: (ids: string[]) => void;
  ref?: Ref<HTMLDivElement>;
}

type CheckState = "checked" | "unchecked" | "indeterminate";

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  expandedIds: string[];
  onToggle: (id: string) => void;
  selectedId?: string;
  onNodeSelect?: (node: TreeNode) => void;
  showIcons: boolean;
  defaultIcon: "folder" | "file" | "none";
  indentSize: number;
  showCheckbox: boolean;
  getCheckState: (id: string) => CheckState;
  onCheckChange: (node: TreeNode, checked: boolean) => void;
}

const TreeNodeItem = ({
  node,
  level,
  expandedIds,
  onToggle,
  selectedId,
  onNodeSelect,
  showIcons,
  defaultIcon,
  indentSize,
  showCheckbox,
  getCheckState,
  onCheckChange,
}: TreeNodeItemProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.includes(node.id);
  const isSelected = selectedId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  const handleSelect = () => {
    if (!node.disabled) {
      onNodeSelect?.(node);
      if (hasChildren) {
        onToggle(node.id);
      }
    }
  };

  const checkState = getCheckState(node.id);

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!node.disabled) {
      onCheckChange(node, checkState !== "checked");
    }
  };

  const renderIcon = () => {
    if (node.icon) return node.icon;
    if (!showIcons || defaultIcon === "none") return null;

    if (hasChildren || defaultIcon === "folder") {
      return <Folder size="sm" className="text-[#808088]" />;
    }
    return <File size="sm" className="text-[#808088]" />;
  };

  if (process.env.NODE_ENV !== "production") {
    if (node.render && typeof node.label !== "string") {
      console.warn(
        `[TreeView] Node with id "${node.id}" uses a \`render\` prop without a string \`label\`. This harms accessibility. Please provide a \`label\` for the \`aria-label\`.`
      );
    }
    if (typeof node.label !== "string" && !node.render) {
      console.warn(
        `[TreeView] Node with id "${node.id}" has neither a \`label\` nor a \`render\` prop. It will be rendered as an empty node.`
      );
    }
  }
  const content = node.render ?? node.label;

  return (
    <div>
      <div
        role="treeitem"
        aria-label={typeof node.label === "string" ? node.label : undefined}
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        tabIndex={node.disabled ? -1 : 0}
        onClick={handleSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleSelect();
          }
          if (e.key === "ArrowRight" && hasChildren && !isExpanded) {
            onToggle(node.id);
          }
          if (e.key === "ArrowLeft" && hasChildren && isExpanded) {
            onToggle(node.id);
          }
        }}
        className={cn(
          "flex h-9 cursor-pointer select-none items-center gap-2 rounded-md px-2 text-sm transition-colors",
          isSelected ? "bg-[#EBF2FF] text-brand" : "text-[#333340] hover:bg-[#F5F5F5]",
          node.disabled && "cursor-not-allowed opacity-50"
        )}
        style={{ paddingLeft: `${level * indentSize + 8}px` }}
      >
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            "flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center",
            !hasChildren && "invisible"
          )}
          tabIndex={-1}
        >
          {hasChildren &&
            (isExpanded ? (
              <ChevronDown size="sm" className="text-[#808088]" />
            ) : (
              <ChevronRight size="sm" className="text-[#808088]" />
            ))}
        </button>

        {showCheckbox && (
          <button
            type="button"
            onClick={handleCheckClick}
            className={cn(
              "flex h-4 w-4 flex-shrink-0 cursor-pointer items-center justify-center rounded border transition-colors",
              checkState === "checked"
                ? "border-brand bg-brand text-white"
                : checkState === "indeterminate"
                  ? "border-brand bg-brand text-white"
                  : "border-[#D9D9D9] bg-white"
            )}
            tabIndex={-1}
          >
            {checkState === "checked" && <Check size="xs" />}
            {checkState === "indeterminate" && <Minus size="xs" />}
          </button>
        )}

        {showIcons && <span className="flex-shrink-0">{renderIcon()}</span>}

        <span className={cn("truncate", isSelected && "font-medium")}>{content}</span>
      </div>

      {hasChildren && isExpanded && (
        <div role="group">
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              selectedId={selectedId}
              onNodeSelect={onNodeSelect}
              showIcons={showIcons}
              defaultIcon={defaultIcon}
              indentSize={indentSize}
              showCheckbox={showCheckbox}
              getCheckState={getCheckState}
              onCheckChange={onCheckChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const getAllDescendantIds = (node: TreeNode): string[] => {
  if (!node.children || node.children.length === 0) return [];
  return node.children.reduce<string[]>((acc, child) => {
    return [...acc, child.id, ...getAllDescendantIds(child)];
  }, []);
};

const findNodeById = (nodes: TreeNode[], id: string): TreeNode | undefined => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

const _getParentIds = (nodes: TreeNode[], targetId: string, parents: string[] = []): string[] => {
  for (const node of nodes) {
    if (node.id === targetId) return parents;
    if (node.children) {
      const result = _getParentIds(node.children, targetId, [...parents, node.id]);
      if (result.length > 0 || node.children.some((c) => c.id === targetId)) {
        return result.length > 0 ? result : [...parents, node.id];
      }
    }
  }
  return [];
};

function TreeView({
  data,
  defaultExpandedIds = [],
  expandedIds: controlledExpandedIds,
  onExpandedChange,
  selectedId,
  onNodeSelect,
  showIcons = true,
  defaultIcon = "folder",
  indentSize = 24,
  height,
  showCheckbox = false,
  checkedIds: controlledCheckedIds,
  defaultCheckedIds = [],
  onCheckedChange,
  className,
  style,
  ref,
  ...props
}: TreeViewProps) {
  const [internalExpandedIds, setInternalExpandedIds] = useState<string[]>(defaultExpandedIds);
  const [internalCheckedIds, setInternalCheckedIds] = useState<string[]>(defaultCheckedIds);

  const expandedIds = controlledExpandedIds ?? internalExpandedIds;
  const checkedIds = controlledCheckedIds ?? internalCheckedIds;

  const handleToggle = useCallback(
    (id: string) => {
      const newExpandedIds = expandedIds.includes(id)
        ? expandedIds.filter((eid) => eid !== id)
        : [...expandedIds, id];

      if (controlledExpandedIds === undefined) {
        setInternalExpandedIds(newExpandedIds);
      }
      onExpandedChange?.(newExpandedIds);
    },
    [expandedIds, controlledExpandedIds, onExpandedChange]
  );

  const getCheckState = useCallback(
    (id: string): CheckState => {
      const node = findNodeById(data, id);
      if (!node) return "unchecked";

      if (!node.children || node.children.length === 0) {
        return checkedIds.includes(id) ? "checked" : "unchecked";
      }

      const descendantIds = getAllDescendantIds(node);
      const checkedDescendants = descendantIds.filter((did) => checkedIds.includes(did));

      if (checkedDescendants.length === 0) return "unchecked";
      if (checkedDescendants.length === descendantIds.length) return "checked";
      return "indeterminate";
    },
    [data, checkedIds]
  );

  const handleCheckChange = useCallback(
    (node: TreeNode, checked: boolean) => {
      let newCheckedIds = [...checkedIds];

      const descendantIds = getAllDescendantIds(node);
      const allIds = [node.id, ...descendantIds];

      if (checked) {
        allIds.forEach((id) => {
          if (!newCheckedIds.includes(id)) {
            newCheckedIds.push(id);
          }
        });
      } else {
        newCheckedIds = newCheckedIds.filter((id) => !allIds.includes(id));
      }

      if (controlledCheckedIds === undefined) {
        setInternalCheckedIds(newCheckedIds);
      }
      onCheckedChange?.(newCheckedIds);
    },
    [checkedIds, controlledCheckedIds, onCheckedChange]
  );

  return (
    <div
      ref={ref}
      role="tree"
      className={cn("w-full overflow-auto rounded-md border border-[#D9D9D9] p-2", className)}
      style={{ height, ...style }}
      {...props}
    >
      {data.map((node) => (
        <TreeNodeItem
          key={node.id}
          node={node}
          level={0}
          expandedIds={expandedIds}
          onToggle={handleToggle}
          selectedId={selectedId}
          onNodeSelect={onNodeSelect}
          showIcons={showIcons}
          defaultIcon={defaultIcon}
          indentSize={indentSize}
          showCheckbox={showCheckbox}
          getCheckState={getCheckState}
          onCheckChange={handleCheckChange}
        />
      ))}
    </div>
  );
}

export { TreeView };
