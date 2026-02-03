import { AgGridReact } from "ag-grid-react";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import type {
  ColDef,
  CellValueChangedEvent,
  ICellRendererParams,
  GridApi,
  GridReadyEvent,
  RowClassParams,
} from "ag-grid-community";
import { useRef, useState, useMemo, useCallback } from "react";
import { Button, Spinner } from "@pf-dev/ui";
import type { AttendanceData } from "./types";
import { useToastContext } from "../../contexts/ToastContext";
import { useAttendance } from "./hooks";
import { AgGridPagination, AgGridSearchFilter } from "../../components";
import type { SearchFilters } from "../../components";
import { highlightText, escapeRegex } from "@/utils";

export function AttendancePage() {
  const gridRef = useRef<AgGridReactType<AttendanceData>>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const { toast } = useToastContext();

  const { data, isLoading, isError, error, isSaving, save, refreshData } = useAttendance();

  const [localEdits, setLocalEdits] = useState<Map<number, Partial<AttendanceData>>>(new Map());
  const [filteredData, setFilteredData] = useState<AttendanceData[] | null>(null);
  const [activeSearchTerm, setActiveSearchTerm] = useState("");

  const allData = useMemo(() => {
    return data.map((row) => {
      const localEdit = localEdits.get(row.id);
      return localEdit ? { ...row, ...localEdit } : row;
    });
  }, [data, localEdits]);

  const displayData = filteredData ?? allData;

  const editedRowIds = useMemo(() => {
    return new Set(localEdits.keys());
  }, [localEdits]);

  const getRowStyle = useCallback(
    (params: RowClassParams<AttendanceData>) => {
      if (params.data && editedRowIds.has(params.data.id)) {
        return { backgroundColor: "#fef3c7" };
      }
      return undefined;
    },
    [editedRowIds]
  );

  const onGridReady = useCallback((event: GridReadyEvent) => {
    setGridApi(event.api);
  }, []);

  const deviceNameCellRenderer = useCallback(
    (params: ICellRendererParams<AttendanceData>) => {
      const value = params.data?.deviceName ?? "";
      if (activeSearchTerm) {
        return <>{highlightText(value, activeSearchTerm)}</>;
      }
      return <>{value}</>;
    },
    [activeSearchTerm]
  );

  const workContentCellRenderer = useCallback(
    (params: ICellRendererParams<AttendanceData>) => {
      const value = params.data?.workContent ?? "";
      if (activeSearchTerm) {
        return <>{highlightText(value, activeSearchTerm)}</>;
      }
      return <>{value}</>;
    },
    [activeSearchTerm]
  );

  const columnDefs = useMemo<ColDef<AttendanceData>[]>(
    () => [
      {
        headerName: "출역일자",
        field: "attendanceDate",
        width: 150,
        editable: false,
      },
      {
        headerName: "단말기명",
        field: "deviceName",
        flex: 1,
        editable: false,
        cellRenderer: deviceNameCellRenderer,
      },
      {
        headerName: "출역인원",
        field: "attendanceCount",
        width: 120,
        editable: false,
      },
      {
        headerName: "금일 작업 내용",
        field: "workContent",
        flex: 2,
        editable: true,
        cellRenderer: workContentCellRenderer,
      },
    ],
    [deviceNameCellRenderer, workContentCellRenderer]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  );

  const handleSearch = useCallback(
    (filters: SearchFilters) => {
      const { search, startDate, endDate } = filters;

      const filtered = allData.filter((row) => {
        let matchesSearch = true;
        if (search) {
          const regex = new RegExp(escapeRegex(search), "i");
          matchesSearch =
            regex.test(row.deviceName) ||
            regex.test(row.workContent) ||
            regex.test(String(row.attendanceCount));
        }

        const matchesDate =
          (!startDate || row.attendanceDate >= startDate) &&
          (!endDate || row.attendanceDate <= endDate);

        return matchesSearch && matchesDate;
      });

      setFilteredData(filtered);
      setActiveSearchTerm(search);
    },
    [allData]
  );

  const handleSearchReset = useCallback(() => {
    setFilteredData(null);
    setActiveSearchTerm("");
  }, []);

  const handleCellValueChanged = useCallback((event: CellValueChangedEvent<AttendanceData>) => {
    if (!event.data) return;

    const rowId = event.data.id;
    const field = event.colDef.field as keyof AttendanceData;

    setLocalEdits((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(rowId) ?? {};
      newMap.set(rowId, { ...existing, [field]: event.newValue });
      return newMap;
    });
  }, []);

  const handleSave = async () => {
    if (editedRowIds.size === 0) {
      toast.error("저장할 변경 사항이 없습니다.");
      return;
    }

    try {
      const updates = Array.from(editedRowIds)
        .map((id) => {
          const row = allData.find((r) => r.id === id);
          return row ? { id: row.id, workContent: row.workContent } : null;
        })
        .filter((item): item is { id: number; workContent: string } => item !== null);

      await save(updates);
      await refreshData();

      setLocalEdits(new Map());
      setFilteredData(null);

      toast.success("저장되었습니다.");
    } catch (err) {
      console.error("Save error:", err);
      const message = err instanceof Error ? err.message : "저장에 실패했습니다.";
      toast.error(message);
    }
  };

  const handleExport = useCallback(() => {
    const date = new Date();
    const dateString = date.toISOString().split("T")[0];
    const fileName = `출역관리_${dateString}.csv`;

    gridRef.current?.api.exportDataAsCsv({
      fileName,
      suppressQuotes: true,
    });
  }, []);

  // 로딩 상태 렌더링
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 렌더링
  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-red-500">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-gray-700">
            {error instanceof Error ? error.message : "데이터를 불러오는데 실패했습니다."}
          </p>
          <Button onClick={() => refreshData()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  const hasChanges = editedRowIds.size > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">출역 관리</h1>
            <p className="mt-1 text-sm text-gray-500">
              출역 현황을 조회하고 작업 내용을 관리합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <AgGridSearchFilter
              onSearch={handleSearch}
              onReset={handleSearchReset}
              searchPlaceholder="단말기명, 작업내용 검색..."
              showDateRange={true}
              dateValidation={true}
              onDateError={(msg) => toast.error(msg)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} variant="outline" disabled={isSaving || !hasChanges}>
              {isSaving ? "저장 중..." : `저장${hasChanges ? ` (${editedRowIds.size})` : ""}`}
            </Button>
            <Button onClick={handleExport} variant="outline">
              내보내기
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200">
        {displayData.length === 0 ? (
          <div className="flex flex-1 items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>데이터가 없습니다.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <AgGridReact
                ref={gridRef}
                rowData={displayData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                animateRows={true}
                rowSelection={{
                  mode: "multiRow",
                  checkboxes: true,
                  headerCheckbox: true,
                  selectAll: "currentPage",
                }}
                pagination={true}
                paginationPageSize={20}
                suppressPaginationPanel={true}
                onGridReady={onGridReady}
                onCellValueChanged={handleCellValueChanged}
                getRowId={(params) => String(params.data.id)}
                getRowStyle={getRowStyle}
              />
            </div>
            <AgGridPagination api={gridApi} pageSizeOptions={[10, 20, 50, 100]} />
          </>
        )}
      </div>
    </div>
  );
}
