import { useState, useMemo, type Ref } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "../../atoms/Icon";
import { cn } from "../../utils";
import { Checkbox } from "../../atoms/Checkbox";
import { Button } from "../../atoms/Button";

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  pagination?: boolean;
  pageSize?: number;
  bulkActions?: React.ReactNode;
  className?: string;
}

interface DataTableBulkActionBarProps {
  selectedCount: number;
  onDelete?: () => void;
  onExport?: () => void;
  onCancel?: () => void;
  children?: React.ReactNode;
  ref?: Ref<HTMLDivElement>;
}

function DataTableBulkActionBar({
  selectedCount,
  onDelete,
  onExport,
  onCancel,
  children,
  ref,
}: DataTableBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      ref={ref}
      className="mb-4 flex h-12 items-center justify-between rounded-lg bg-brand px-4 text-white dark:bg-primary-700"
    >
      <span className="text-sm font-bold">
        ✓ {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
      </span>
      <div className="flex items-center gap-2">
        {children}
        {onDelete && (
          <Button
            size="sm"
            variant="error"
            onClick={onDelete}
            className="h-8 rounded-md bg-error-500 hover:bg-error-600"
          >
            🗑 Delete
          </Button>
        )}
        {onExport && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onExport}
            className="h-8 rounded-md bg-white text-brand hover:bg-gray-50"
          >
            📤 Export
          </Button>
        )}
        {onCancel && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="h-8 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalItems: number;
  ref?: Ref<HTMLDivElement>;
}

function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  ref,
}: DataTablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div ref={ref} className="mt-2 flex flex-col items-center justify-center gap-1">
      <div className="flex w-full items-center gap-1 text-xs text-muted dark:text-dark-text-muted">
        <span>전체</span>
        <span className="font-semibold text-secondary dark:text-dark-text-secondary">
          {totalItems.toLocaleString()}
        </span>
        <span>건</span>
        <span className="text-neutral-300">
          ({startItem.toLocaleString()} - {endItem.toLocaleString()})
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 w-8 p-0 font-medium text-placeholder"
        >
          <ChevronLeft size="sm" />
        </Button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }
          const isActive = currentPage === pageNum;
          return (
            <Button
              key={pageNum}
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "h-8 w-8 p-0 text-xs font-medium text-secondary dark:text-dark-text-secondary",
                isActive &&
                  "bg-primary-200 text-brand hover:bg-primary-200 dark:bg-primary-800 dark:text-primary-300"
              )}
            >
              {pageNum}
            </Button>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 w-8 p-1 font-medium text-placeholder"
        >
          <ChevronRight size="sm" />
        </Button>
      </div>
    </div>
  );
}

function DataTableComponent<T>({
  data,
  columns,
  selectable = false,
  onSelectionChange,
  pagination = false,
  pageSize = 10,
  className,
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // 데이터가 변경되어 현재 페이지가 유효 범위를 벗어나면 자동 조정
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const effectiveCurrentPage = useMemo(() => {
    if (!pagination) return currentPage;
    return Math.min(currentPage, totalPages);
  }, [currentPage, totalPages, pagination]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIndexes = new Set(data.map((_, index) => index));
      setSelectedRows(allIndexes);
      onSelectionChange?.(data);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(data.filter((_, i) => newSelected.has(i)));
  };

  const handleSort = (columnKey: keyof T | string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn as keyof T];
    const bVal = b[sortColumn as keyof T];
    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    const comparison = String(aVal).localeCompare(String(bVal));
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const paginatedData = pagination
    ? sortedData.slice((effectiveCurrentPage - 1) * pageSize, effectiveCurrentPage * pageSize)
    : sortedData;

  const isAllSelected = selectedRows.size === data.length && data.length > 0;

  return (
    <div className={className}>
      <DataTableBulkActionBar
        selectedCount={selectedRows.size}
        onDelete={() => console.log("Delete", Array.from(selectedRows))}
        onExport={() => console.log("Export", Array.from(selectedRows))}
        onCancel={() => {
          setSelectedRows(new Set());
          onSelectionChange?.([]);
        }}
      />

      <div className="w-full overflow-auto border-y border-t-2 border-neutral-300 dark:border-dark-border-default">
        <table className="w-full caption-bottom text-xs">
          <thead className="bg-neutral-200/90 dark:bg-dark-bg-tertiary">
            <tr className="border-b border-neutral-300 dark:border-dark-border-default">
              {selectable && (
                <th className="h-9 w-12 px-4 border-r border-neutral-300 dark:border-dark-border-default">
                  <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "h-9 px-4 text-center text-xs font-bold text-muted border-r border-neutral-300 last:border-r-0",
                    "dark:text-dark-text-muted dark:border-dark-border-default",
                    column.sortable && "cursor-pointer select-none",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center justify-center gap-1">
                    {column.header}
                    {column.sortable &&
                      sortColumn === column.key &&
                      (sortDirection === "asc" ? (
                        <ChevronUp size="sm" />
                      ) : (
                        <ChevronDown size="sm" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {paginatedData.map((row, rowIndex) => {
              const actualIndex = pagination
                ? (effectiveCurrentPage - 1) * pageSize + rowIndex
                : rowIndex;
              return (
                <tr
                  key={actualIndex}
                  className={cn(
                    "h-9 border-b border-neutral-300 transition-colors",
                    "dark:border-dark-border-default",
                    selectedRows.has(actualIndex) && "bg-blue-50 dark:bg-primary-900/30"
                  )}
                >
                  {selectable && (
                    <td className="w-12 px-4 text-center align-middle border-r border-neutral-300 dark:border-dark-border-default">
                      <Checkbox
                        checked={selectedRows.has(actualIndex)}
                        onCheckedChange={(checked) =>
                          handleSelectRow(actualIndex, checked as boolean)
                        }
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn(
                        "px-4 py-3 text-center align-middle text-xs text-secondary border-r border-neutral-300 last:border-r-0",
                        "dark:text-dark-text-secondary dark:border-dark-border-default",
                        column.className
                      )}
                    >
                      {column.render
                        ? column.render(row, actualIndex)
                        : String(row[column.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && (
        <DataTablePagination
          currentPage={effectiveCurrentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalItems={data.length}
        />
      )}
    </div>
  );
}

const DataTable = DataTableComponent as <T>(props: DataTableProps<T>) => React.ReactElement;

export { DataTable, DataTableBulkActionBar, DataTablePagination };
