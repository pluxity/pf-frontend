import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from "react";
import type { ICellEditorParams } from "ag-grid-community";
import { Input, Button } from "@pf-dev/ui";
import { X, Plus } from "@pf-dev/ui";

export interface ComboBoxItem {
  id: number;
  name: string;
}

export interface AgGridComboBoxProps extends ICellEditorParams {
  items: ComboBoxItem[];
  onAdd?: (name: string) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onAddSuccess?: (name: string) => void;
  onDeleteSuccess?: () => void;
  placeholder?: string;
  addErrorMessage?: string;
  deleteErrorMessage?: string;
}

interface AgGridComboBoxRef {
  getValue: () => number;
  isCancelAfterEnd: () => boolean;
  isPopup: () => boolean;
}

export const AgGridComboBox = forwardRef<AgGridComboBoxRef, AgGridComboBoxProps>((props, ref) => {
  const {
    value,
    items,
    onAdd,
    onDelete,
    onAddSuccess,
    onDeleteSuccess,
    stopEditing,
    column,
    node,
    eGridCell,
    placeholder = "새 항목",
    addErrorMessage = "추가 실패",
    deleteErrorMessage = "삭제 실패",
  } = props;

  const colId = column?.getColId();
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const cellWidthPx = Math.max(column?.getActualWidth() ?? 200, 200);
  const cellHeightPx = eGridCell?.offsetHeight ?? 40;
  const cellWidthRem = cellWidthPx / rootFontSize;
  const cellHeightRem = cellHeightPx / rootFontSize;

  const [selectedId, setSelectedId] = useState<number>(value as number);
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 콤보박스 방향 결정 (아래 공간이 부족하면 위로)
  useEffect(() => {
    if (!eGridCell) return;
    const cellRect = eGridCell.getBoundingClientRect();
    const dropdownHeightPx = 25 * rootFontSize; // 25rem
    const spaceBelow = window.innerHeight - cellRect.bottom;
    setOpenUpward(spaceBelow < dropdownHeightPx);
  }, [eGridCell, rootFontSize]);

  useImperativeHandle(
    ref,
    () => ({
      getValue: () => value,
      isCancelAfterEnd: () => true,
      isPopup: () => true,
    }),
    [value]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        stopEditing();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [stopEditing]);

  const handleSelect = useCallback(
    (id: number) => {
      setSelectedId(id);
      if (node && colId) {
        node.setDataValue(colId, id);
      }
      stopEditing();
    },
    [stopEditing, node, colId]
  );

  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (err instanceof Error) return err.message;
    return fallback;
  };

  const handleAdd = async () => {
    if (!newName.trim() || !onAdd) return;
    const name = newName.trim();
    setIsAdding(true);
    setError(null);
    try {
      await onAdd(name);
      setNewName("");
      onAddSuccess?.(name);
    } catch (err) {
      setError(getErrorMessage(err, addErrorMessage));
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete) return;
    setDeletingId(id);
    setError(null);
    try {
      await onDelete(id);
      onDeleteSuccess?.();
    } catch (err) {
      setError(getErrorMessage(err, deleteErrorMessage));
    } finally {
      setDeletingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAdding && newName.trim()) {
      e.preventDefault();
      handleAdd();
    } else if (e.key === "Escape") {
      stopEditing();
    }
  };

  const showAddInput = !!onAdd;
  const showDeleteButton = !!onDelete;

  return (
    <div
      ref={containerRef}
      style={{
        width: `${cellWidthRem}rem`,
        ...(openUpward ? { bottom: 0 } : { top: `${cellHeightRem}rem` }),
      }}
      className="absolute left-0 z-50 rounded-lg border border-gray-200 bg-white shadow-lg"
    >
      {error && (
        <div className="border-b border-gray-100 bg-red-50 px-3 py-1.5 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="max-h-48 overflow-y-auto p-1">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelect(item.id)}
            className={`flex cursor-pointer items-center justify-between rounded px-3 py-2 text-sm hover:bg-gray-100 ${
              selectedId === item.id ? "bg-blue-50 text-blue-700" : "text-gray-700"
            }`}
          >
            <span>{item.name}</span>
            {showDeleteButton && (
              <button
                onClick={(e) => handleDelete(item.id, e)}
                disabled={deletingId === item.id}
                className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-200 hover:text-red-500 disabled:opacity-50"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {showAddInput && (
        <div className="flex gap-1 border-t border-gray-100 p-2">
          <Input
            placeholder={placeholder}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 flex-1 text-sm"
            autoFocus={false}
          />
          <Button
            onClick={handleAdd}
            disabled={!newName.trim() || isAdding}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus size="sm" />
          </Button>
        </div>
      )}
    </div>
  );
});

AgGridComboBox.displayName = "AgGridComboBox";
