import { AgGridReact } from "ag-grid-react";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import type {
  ColDef,
  CellValueChangedEvent,
  CellClassParams,
  ICellRendererParams,
  RowClassParams,
} from "ag-grid-community";
import { useRef, useState, useMemo, useCallback } from "react";
import { SearchBar, Button, Spinner } from "@pf-dev/ui";
import type { ProcessStatusData, ProcessStatusBulkRequest } from "./types";
import { useToastContext } from "../../contexts/ToastContext";
import { useProcessStatus } from "./hooks";

export function ProcessStatusPage() {
  const gridRef = useRef<AgGridReactType<ProcessStatusData>>(null);
  const { toast } = useToastContext();

  // SWR 훅 사용
  const { data, workTypes, isLoading, isError, error, isSaving, saveAndRefresh, refresh } =
    useProcessStatus();

  // 로컬 편집 상태 (서버 데이터와 분리)
  const [localAdditions, setLocalAdditions] = useState<ProcessStatusData[]>([]);
  const [localEdits, setLocalEdits] = useState<Map<number | null, Partial<ProcessStatusData>>>(
    new Map()
  );
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  // 검색 필터
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 검색 하이라이트용 상태
  const [activeSearchTerm, setActiveSearchTerm] = useState("");

  // 유효성 검사 함수 (공정률 ≤ 목표율)
  const validateRow = useCallback((row: ProcessStatusData): boolean => {
    return row.actualRate <= row.plannedRate;
  }, []);

  // 임시 ID 생성 (신규 행)
  const tempIdRef = useRef(-1);
  const generateTempId = () => {
    tempIdRef.current -= 1;
    return tempIdRef.current;
  };

  // 서버 데이터 + 로컬 편집을 합친 전체 데이터
  const allData = useMemo(() => {
    // 서버 데이터에서 삭제된 것 제외하고 편집 적용
    const serverData = (data ?? [])
      .filter((row) => row.id === null || !deletedIds.has(row.id))
      .map((row) => {
        const edits = localEdits.get(row.id);
        return edits ? { ...row, ...edits } : row;
      });

    // 로컬 추가 데이터에 편집 적용
    const addedData = localAdditions.map((row) => {
      const edits = localEdits.get(row.id);
      return edits ? { ...row, ...edits } : row;
    });

    return [...addedData, ...serverData];
  }, [data, localAdditions, localEdits, deletedIds]);

  // 필터링된 데이터
  const [filteredData, setFilteredData] = useState<ProcessStatusData[] | null>(null);
  const displayData = filteredData ?? allData;

  // 변경된 행 ID 목록
  const editedRowIds = useMemo(() => {
    const ids = new Set<number | null>();
    localAdditions.forEach((row) => ids.add(row.id));
    localEdits.forEach((_, id) => ids.add(id));
    return ids;
  }, [localAdditions, localEdits]);

  // 변경된 행 스타일 적용
  const getRowStyle = useCallback(
    (params: RowClassParams<ProcessStatusData>) => {
      if (params.data && editedRowIds.has(params.data.id)) {
        return { backgroundColor: "#fef3c7" }; // amber-100
      }
      return undefined;
    },
    [editedRowIds]
  );

  // 검색어 하이라이트 함수
  const highlightText = useCallback((text: string, searchTerm: string): React.ReactNode => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: "#ffff00" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  }, []);

  // 커스텀 셀 렌더러 (검색 하이라이트용)
  const workTypeNameCellRenderer = useCallback(
    (params: ICellRendererParams<ProcessStatusData>) => {
      const value = params.data?.workTypeName ?? "";
      if (activeSearchTerm) {
        return <>{highlightText(value, activeSearchTerm)}</>;
      }
      return <>{value}</>;
    },
    [activeSearchTerm, highlightText]
  );

  const plannedRateCellRenderer = useCallback(
    (params: ICellRendererParams<ProcessStatusData>) => {
      const value = String(params.value ?? "");
      if (activeSearchTerm) {
        return <>{highlightText(value, activeSearchTerm)}</>;
      }
      return <>{value}</>;
    },
    [activeSearchTerm, highlightText]
  );

  const actualRateCellRenderer = useCallback(
    (params: ICellRendererParams<ProcessStatusData>) => {
      const value = String(params.value ?? "");
      if (activeSearchTerm) {
        return <>{highlightText(value, activeSearchTerm)}</>;
      }
      return <>{value}</>;
    },
    [activeSearchTerm, highlightText]
  );

  // 컬럼 정의
  const columnDefs = useMemo<ColDef<ProcessStatusData>[]>(
    () => [
      {
        headerName: "작업일",
        field: "workDate",
        width: 150,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        editable: true,
        cellEditor: "agDateStringCellEditor",
      },
      {
        headerName: "공정명",
        field: "workTypeId",
        flex: 2,
        editable: true,
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: workTypes.map((wt) => wt.id),
        },
        valueFormatter: (params) => {
          const workType = workTypes.find((wt) => wt.id === params.value);
          return workType?.name ?? "";
        },
        valueSetter: (params) => {
          const workType = workTypes.find((wt) => wt.id === params.newValue);
          if (workType) {
            params.data.workTypeId = workType.id;
            params.data.workTypeName = workType.name;
            return true;
          }
          return false;
        },
        cellRenderer: workTypeNameCellRenderer,
      },
      {
        headerName: "목표율 (%)",
        field: "plannedRate",
        flex: 1,
        editable: true,
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          precision: 0,
          step: 1,
          min: 0,
          max: 100,
        },
        cellRenderer: plannedRateCellRenderer,
        cellClassRules: {
          "bg-red-100": (params: CellClassParams<ProcessStatusData>) =>
            params.data ? !validateRow(params.data) : false,
        },
      },
      {
        headerName: "공정률 (%)",
        field: "actualRate",
        flex: 1,
        editable: true,
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          precision: 0,
          step: 1,
          min: 0,
          max: 100,
        },
        cellRenderer: actualRateCellRenderer,
        cellClassRules: {
          "bg-red-100": (params: CellClassParams<ProcessStatusData>) =>
            params.data ? !validateRow(params.data) : false,
        },
      },
    ],
    [
      workTypes,
      workTypeNameCellRenderer,
      plannedRateCellRenderer,
      actualRateCellRenderer,
      validateRow,
    ]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      resizable: true,
    }),
    []
  );

  // 검색 필터링
  const handleSearch = useCallback(() => {
    // 날짜 유효성 검사
    if (startDate && endDate && startDate > endDate) {
      toast.error("시작일자가 종료일자보다 늦을 수 없습니다.");
      return;
    }

    const filtered = allData.filter((row) => {
      const searchLower = search.toLowerCase();
      const filterSearch =
        search === "" ||
        row.workTypeName.toLowerCase().includes(searchLower) ||
        row.plannedRate.toString().includes(search) ||
        row.actualRate.toString().includes(search);

      const filterDate =
        (!startDate || row.workDate >= startDate) && (!endDate || row.workDate <= endDate);

      return filterSearch && filterDate;
    });

    setFilteredData(filtered);
    setActiveSearchTerm(search);
  }, [allData, search, startDate, endDate, toast]);

  // 필터 초기화
  const handleResetFilter = useCallback(() => {
    setFilteredData(null);
    setSearch("");
    setStartDate("");
    setEndDate("");
    setActiveSearchTerm("");
  }, []);

  // 내보내기
  const handleExport = () => {
    const date = new Date();
    const dateString = date.toISOString().split("T")[0];
    const fileName = `공정현황_${dateString}.csv`;

    gridRef.current?.api.exportDataAsCsv({
      fileName: fileName,
      suppressQuotes: true,
    });
  };

  // 셀 값 변경
  const handleCellValueChanged = (event: CellValueChangedEvent<ProcessStatusData>) => {
    if (!event.data) return;
    const rowId = event.data.id;
    const field = event.colDef.field as keyof ProcessStatusData;

    setLocalEdits((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(rowId) ?? {};
      newMap.set(rowId, { ...existing, [field]: event.newValue });
      return newMap;
    });

    // 공정률이 목표율을 초과하면 경고 표시
    if (!validateRow(event.data)) {
      toast.warning("공정률이 목표율을 초과했습니다.");
    }
  };

  // 신규 행 생성
  const handleCreate = () => {
    if (workTypes.length === 0) {
      toast.error("공정명을 먼저 등록해주세요.");
      return;
    }

    const today = new Date().toISOString().split("T")[0] ?? "";
    const tempId = generateTempId();
    const defaultWorkType = workTypes[0]!;

    const newRow: ProcessStatusData = {
      id: tempId,
      workDate: today,
      workTypeId: defaultWorkType.id,
      workTypeName: defaultWorkType.name,
      plannedRate: 0,
      actualRate: 0,
      isNew: true,
    };

    setLocalAdditions((prev) => [newRow, ...prev]);
  };

  // 저장
  const handleSave = async () => {
    if (editedRowIds.size === 0 && deletedIds.size === 0) {
      toast.error("저장할 변경 사항이 없습니다.");
      return;
    }

    // 유효성 검사: 공정률이 목표율을 초과하는 데이터가 있는지 확인
    const invalidRows = allData.filter((row) => editedRowIds.has(row.id) && !validateRow(row));
    if (invalidRows.length > 0) {
      toast.error("공정률이 목표율을 초과하는 데이터가 있습니다. 수정 후 저장해주세요.");
      return;
    }

    try {
      // 저장할 데이터 수집
      const dataToSave = allData.filter((row) => editedRowIds.has(row.id));

      const request: ProcessStatusBulkRequest = {
        upserts: dataToSave.map((row) => ({
          id: row.id !== null && row.id > 0 ? row.id : undefined,
          workDate: row.workDate,
          workTypeId: row.workTypeId,
          plannedRate: row.plannedRate,
          actualRate: row.actualRate,
        })),
        deletedIds: Array.from(deletedIds),
      };

      await saveAndRefresh(request);

      // 로컬 상태 초기화
      setLocalAdditions([]);
      setLocalEdits(new Map());
      setDeletedIds(new Set());
      setFilteredData(null);

      toast.success("저장되었습니다.");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("저장에 실패했습니다.");
    }
  };

  // 삭제
  const handleDelete = () => {
    const selectedRows = gridRef.current?.api.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
      toast.error("삭제할 항목을 선택해주세요.");
      return;
    }

    const selectedIds = selectedRows.map((row) => row.id);

    // 기존 데이터는 deletedIds에 추가
    selectedIds.forEach((id) => {
      if (id !== null && id > 0) {
        setDeletedIds((prev) => new Set(prev).add(id));
      }
    });

    // 로컬 추가 데이터는 바로 제거
    setLocalAdditions((prev) => prev.filter((row) => !selectedIds.includes(row.id)));

    // 편집 상태에서도 제거
    setLocalEdits((prev) => {
      const newMap = new Map(prev);
      selectedIds.forEach((id) => newMap.delete(id));
      return newMap;
    });

    // 필터된 데이터에서도 제거
    if (filteredData) {
      setFilteredData(filteredData.filter((row) => !selectedIds.includes(row.id)));
    }
  };

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
          <Button onClick={() => refresh()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  const hasChanges = editedRowIds.size > 0 || deletedIds.size > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">공정 현황</h1>
            <p className="mt-1 text-sm text-gray-500">공정 현황 관리</p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex gap-4">
          <div className="flex-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">검색어</label>
            <SearchBar
              className="w-full"
              placeholder="검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={handleSearch}
              onClear={() => setSearch("")}
            />
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">시작일자</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                const newStartDate = e.target.value;
                if (endDate && newStartDate > endDate) {
                  toast.warning("시작일자가 종료일자보다 늦을 수 없습니다.");
                  return;
                }
                setStartDate(newStartDate);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">종료일자</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                const newEndDate = e.target.value;
                if (startDate && newEndDate < startDate) {
                  toast.warning("종료일자가 시작일자보다 빠를 수 없습니다.");
                  return;
                }
                setEndDate(newEndDate);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleSearch}>검색</Button>
            {filteredData && (
              <Button onClick={handleResetFilter} variant="outline">
                초기화
              </Button>
            )}
            <Button onClick={handleSave} variant="outline" disabled={isSaving || !hasChanges}>
              {isSaving
                ? "저장 중..."
                : `저장${hasChanges ? ` (${editedRowIds.size + deletedIds.size})` : ""}`}
            </Button>
            <Button onClick={handleExport} variant="outline">
              내보내기
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {displayData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-gray-200 bg-white">
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
          <AgGridReact
            ref={gridRef}
            rowData={displayData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowSelection="multiple"
            pagination={true}
            paginationPageSize={20}
            onCellValueChanged={handleCellValueChanged}
            getRowId={(params) => String(params.data.id)}
            getRowStyle={getRowStyle}
          />
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleCreate}>생성</Button>
        <Button onClick={handleDelete} variant="error">
          삭제
        </Button>
      </div>
    </div>
  );
}
