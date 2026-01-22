import { useEffect, useState } from "react";
import type { GridApi } from "ag-grid-community";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@pf-dev/ui";
import { ChevronLeftDouble, ChevronLeft, ChevronRight, ChevronRightDouble } from "@pf-dev/ui";

interface AgGridPaginationProps {
  api: GridApi | null;
  pageSizeOptions?: number[];
}

export function AgGridPagination({
  api,
  pageSizeOptions = [10, 20, 50, 100],
}: AgGridPaginationProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    if (!api) return;

    const syncState = () => {
      setCurrentPage(api.paginationGetCurrentPage());
      setTotalPages(api.paginationGetTotalPages());
      setTotalRows(api.paginationGetRowCount());
      setPageSize(api.paginationGetPageSize());
    };

    syncState();
    api.addEventListener("paginationChanged", syncState);
    return () => api.removeEventListener("paginationChanged", syncState);
  }, [api]);

  const goToFirstPage = () => api?.paginationGoToFirstPage();
  const goToPreviousPage = () => api?.paginationGoToPreviousPage();
  const goToNextPage = () => api?.paginationGoToNextPage();
  const goToLastPage = () => api?.paginationGoToLastPage();

  const handlePageSizeChange = (value: string) => {
    api?.setGridOption("paginationPageSize", Number(value));
  };

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= totalPages - 1 || totalPages === 0;
  const startRow = totalRows === 0 ? 0 : currentPage * pageSize + 1;
  const endRow = Math.min((currentPage + 1) * pageSize, totalRows);

  const buttonClass =
    "flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white";

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>전체</span>
        <span className="font-semibold text-gray-900">{totalRows.toLocaleString()}</span>
        <span>건</span>
        {totalRows > 0 && (
          <span className="text-gray-400">
            ({startRow.toLocaleString()} - {endRow.toLocaleString()})
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button onClick={goToFirstPage} disabled={isFirstPage} className={buttonClass}>
          <ChevronLeftDouble size="sm" />
        </button>
        <button onClick={goToPreviousPage} disabled={isFirstPage} className={buttonClass}>
          <ChevronLeft size="sm" />
        </button>

        <div className="mx-3 flex items-center gap-1.5 text-sm">
          <span className="font-semibold text-gray-900">{currentPage + 1}</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{totalPages || 1}</span>
        </div>

        <button onClick={goToNextPage} disabled={isLastPage} className={buttonClass}>
          <ChevronRight size="sm" />
        </button>
        <button onClick={goToLastPage} disabled={isLastPage} className={buttonClass}>
          <ChevronRightDouble size="sm" />
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>페이지당</span>
        <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-8 w-[4.375rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>건</span>
      </div>
    </div>
  );
}
