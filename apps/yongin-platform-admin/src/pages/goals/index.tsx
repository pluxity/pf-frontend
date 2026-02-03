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
import { Button, Progress, Spinner } from "@pf-dev/ui";
import type { GoalData, GoalBulkRequest } from "./types";
import { useToastContext } from "../../contexts/ToastContext";
import { useGoals, CalculateGoal } from "./hooks";
import { validateGoal } from "./validation";
import { AgGridPagination, AgGridComboBox, AgGridSearchFilter } from "../../components";
import type { SearchFilters } from "../../components";
import { formatDateKST, highlightText } from "@/utils";

export function GoalsPage() {
  const gridRef = useRef<AgGridReactType<GoalData>>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const { toast } = useToastContext();

  // SWR 훅 사용
  const {
    data,
    constructionSections,
    isLoading,
    isError,
    error,
    isSaving,
    save,
    refreshData,
    addConstructionSection,
    removeConstructionSection,
  } = useGoals();

  // 로컬 편집 상태
  const [localAdditions, setLocalAdditions] = useState<GoalData[]>([]);
  const [localEdits, setLocalEdits] = useState<Map<number | null, Partial<GoalData>>>(new Map());
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [activeSearchTerm, setActiveSearchTerm] = useState("");

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
      .filter((row) => !deletedIds.has(row.id))
      .map((row) => {
        const edits = localEdits.get(row.id);
        const merged = edits ? { ...row, ...edits } : row;
        return CalculateGoal(merged);
      });

    // 로컬 추가 데이터에 편집 적용
    const addedData = localAdditions.map((row) => {
      const edits = localEdits.get(row.id);
      const merged = edits ? { ...row, ...edits } : row;
      return CalculateGoal(merged);
    });

    return [...addedData, ...serverData];
  }, [data, localAdditions, localEdits, deletedIds]);

  // 필터링된 데이터
  const [filteredData, setFilteredData] = useState<GoalData[] | null>(null);
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
    (params: RowClassParams<GoalData>) => {
      if (params.data && editedRowIds.has(params.data.id)) {
        return { backgroundColor: "#fef3c7" }; // amber-100
      }
      return undefined;
    },
    [editedRowIds]
  );

  // 그리드 준비 완료 핸들러
  const onGridReady = useCallback((event: GridReadyEvent) => {
    setGridApi(event.api);
  }, []);

  // 커스텀 셀 렌더러 (검색 하이라이트용)
  const constructionSectionNameCellRenderer = useCallback(
    (params: ICellRendererParams<GoalData>) => {
      const value = params.data?.constructionSectionName ?? "";
      if (activeSearchTerm) {
        return <>{highlightText(value, activeSearchTerm)}</>;
      }
      return <>{value}</>;
    },
    [activeSearchTerm]
  );

  const columnDefs = useMemo<ColDef<GoalData>[]>(
    () => [
      {
        headerName: "작업일",
        field: "inputDate",
        flex: 1.3,
        editable: true,
        cellEditor: "agDateStringCellEditor",
      },
      {
        headerName: "시공구간",
        field: "constructionSectionId",
        flex: 1,
        cellClass: "bg-primary-200",
        editable: true,
        cellEditor: AgGridComboBox,
        cellEditorParams: {
          items: constructionSections,
          onAdd: addConstructionSection,
          onDelete: removeConstructionSection,
          onAddSuccess: (name: string) => toast.success(`"${name}" 시공구간이 추가되었습니다.`),
          onDeleteSuccess: () => toast.success("시공구간이 삭제되었습니다."),
          placeholder: "새 시공구간",
        },
        cellEditorPopup: true,
        valueFormatter: (params) => {
          const section = constructionSections.find((s) => s.id === params.value);
          return section?.name ?? "";
        },
        valueSetter: (params) => {
          const section = constructionSections.find((s) => s.id === params.newValue);
          if (section) {
            params.data.constructionSectionId = section.id;
            params.data.constructionSectionName = section.name;
            return true;
          }
          return false;
        },
        cellRenderer: constructionSectionNameCellRenderer,
      },
      {
        headerName: "진행률",
        field: "progressRate",
        headerTooltip: "누계량/전체량",
        flex: 1.5,
        editable: false,
        cellRenderer: (params: ICellRendererParams<GoalData, number>) => {
          const value = params.value || 0;
          return (
            <div className="flex items-center gap-2">
              <Progress value={value} />
              <span className="font-semibold">{value}%</span>
            </div>
          );
        },
      },
      {
        headerName: "전체량",
        field: "totalQuantity",
        flex: 1,
        cellClass: "bg-primary-200",
        editable: true,
        cellEditor: "agNumberCellEditor",
      },
      {
        headerName: "누계량",
        field: "cumulativeQuantity",
        headerTooltip: "전일 누계량+금일 작업량",
        flex: 1,
        editable: false,
      },
      {
        headerName: "목표량",
        field: "targetQuantity",
        headerTooltip: "전체량/(준공일-착공일)",
        flex: 1,
        editable: false,
      },
      {
        headerName: "작업량",
        field: "workQuantity",
        flex: 1,
        cellClass: "bg-primary-200",
        editable: true,
        cellEditor: "agNumberCellEditor",
      },
      {
        headerName: "공정률",
        field: "constructionRate",
        headerTooltip: "작업량/목표량",
        flex: 0.8,
        editable: false,
        cellRenderer: (params: ICellRendererParams<GoalData, number>) => {
          const value = params.value || 0;
          return `${value}%`;
        },
      },
      {
        headerName: "착공일",
        field: "startDate",
        flex: 1,
        editable: true,
        cellClass: "bg-primary-200",
        cellEditor: "agDateStringCellEditor",
      },
      {
        headerName: "준공일",
        field: "completionDate",
        flex: 1,
        editable: true,
        cellClass: "bg-primary-200",
        cellEditor: "agDateStringCellEditor",
      },
      {
        headerName: "계획작업일",
        field: "plannedWorkDays",
        headerTooltip: "준공일-착공일",
        flex: 1,
        editable: false,
      },
      {
        headerName: "지연일",
        field: "delayDays",
        headerTooltip: "(목표량*(일자-착공일)-누계량)/목표량",
        flex: 1,
        editable: false,
        cellRenderer: (params: ICellRendererParams<GoalData, number>) => {
          const value = params.value ?? 0;
          return value >= 0 ? `+${value}` : value;
        },
      },
    ],
    [
      constructionSections,
      constructionSectionNameCellRenderer,
      addConstructionSection,
      removeConstructionSection,
      toast,
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
  const handleSearch = useCallback(
    (filters: SearchFilters) => {
      const { search, startDate, endDate } = filters;

      const filtered = allData.filter((row) => {
        const searchLower = search.toLowerCase();
        const filterSearch =
          search === "" ||
          row.constructionSectionName.toLowerCase().includes(searchLower) ||
          row.progressRate.toString().includes(search) ||
          row.delayDays.toString().includes(search);

        const filterDate =
          (!startDate || row.inputDate >= startDate) && (!endDate || row.inputDate <= endDate);

        return filterSearch && filterDate;
      });

      setFilteredData(filtered);
      setActiveSearchTerm(search);
    },
    [allData]
  );

  // 필터 초기화
  const handleResetFilter = useCallback(() => {
    setFilteredData(null);
    setActiveSearchTerm("");
  }, []);

  const handleExport = () => {
    const date = new Date();
    const dateString = date.toISOString().split("T")[0];
    const fileName = `목표관리_${dateString}.csv`;

    gridRef.current?.api.exportDataAsCsv({
      fileName: fileName,
      suppressQuotes: true,
    });
  };

  // 셀 값 변경
  const handleCellValueChanged = (event: CellValueChangedEvent<GoalData>) => {
    if (!event.data) return;
    const rowId = event.data.id;
    const field = event.colDef.field as keyof GoalData;

    setLocalEdits((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(rowId) ?? {};

      // constructionSectionId 변경 시 constructionSectionName도 함께 업데이트
      if (field === "constructionSectionId") {
        const section = constructionSections.find((s) => s.id === event.newValue);
        if (section) {
          newMap.set(rowId, {
            ...existing,
            constructionSectionId: section.id,
            constructionSectionName: section.name,
          });
        }
      } else {
        newMap.set(rowId, { ...existing, [field]: event.newValue });
      }

      return newMap;
    });

    // 재계산된 값으로 실시간 업데이트
    const updatedData = allData.find((row) => row.id === rowId);
    if (updatedData) {
      const recalculated = CalculateGoal({ ...updatedData, [field]: event.newValue });
      event.api.applyTransaction({ update: [recalculated] });

      // 유효성 검사
      const errors = validateGoal(recalculated);
      if (errors.length > 0 && errors[0]) {
        toast.warning(errors[0].message);
      }
    }
  };

  // 신규 행 생성
  const handleCreate = () => {
    if (constructionSections.length === 0) {
      toast.error("시공구간을 먼저 등록해주세요.");
      return;
    }

    const today = formatDateKST();
    const tempId = generateTempId();
    const defaultSection = constructionSections[0]!;

    const newRow: GoalData = {
      id: tempId,
      inputDate: today,
      constructionSectionId: defaultSection.id,
      constructionSectionName: defaultSection.name,
      totalQuantity: 0,
      cumulativeQuantity: 0,
      previousCumulativeQuantity: 0,
      targetQuantity: 0,
      workQuantity: 0,
      constructionRate: 0,
      progressRate: 0,
      startDate: today,
      plannedWorkDays: 0,
      completionDate: today,
      delayDays: 0,
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

    try {
      // 저장할 데이터 수집
      const dataToSave = allData.filter((row) => editedRowIds.has(row.id));

      // 유효성 검사
      const allErrors = dataToSave.flatMap((row) => validateGoal(row));
      if (allErrors.length > 0 && allErrors[0]) {
        toast.error(`유효성 검사 실패: ${allErrors[0].message}`);
        return;
      }

      // 삭제될 항목 중에서 (날짜, 시공구간) 조합으로 매핑
      const deletedByKey = new Map<string, number>();
      Array.from(deletedIds).forEach((id) => {
        const deletedRow = data?.find((row) => row.id === id);
        if (deletedRow) {
          const key = `${deletedRow.inputDate}_${deletedRow.constructionSectionId}`;
          deletedByKey.set(key, id);
        }
      });

      const upserts = dataToSave.map((row) => {
        // 새로 추가된 행인 경우, 삭제될 항목 중 같은 (날짜, 시공구간)이 있는지 확인
        if (row.id < 0) {
          const key = `${row.inputDate}_${row.constructionSectionId}`;
          const reusableId = deletedByKey.get(key);
          if (reusableId) {
            // 같은 조합이 있으면 해당 ID를 재사용
            deletedByKey.delete(key); // deletedIds에서 제외하기 위해 삭제(재사용으로 인해 삭제 목록에서 제거)
            return {
              id: reusableId,
              inputDate: row.inputDate,
              constructionSectionId: row.constructionSectionId,
              totalQuantity: row.totalQuantity,
              cumulativeQuantity: row.cumulativeQuantity,
              previousCumulativeQuantity: row.previousCumulativeQuantity,
              targetQuantity: row.targetQuantity,
              workQuantity: row.workQuantity,
              constructionRate: row.constructionRate,
              progressRate: row.progressRate,
              startDate: row.startDate,
              plannedWorkDays: row.plannedWorkDays,
              completionDate: row.completionDate,
              delayDays: row.delayDays,
            };
          }
        }

        return {
          id: row.id > 0 ? row.id : undefined,
          inputDate: row.inputDate,
          constructionSectionId: row.constructionSectionId,
          totalQuantity: row.totalQuantity,
          cumulativeQuantity: row.cumulativeQuantity,
          previousCumulativeQuantity: row.previousCumulativeQuantity,
          targetQuantity: row.targetQuantity,
          workQuantity: row.workQuantity,
          constructionRate: row.constructionRate,
          progressRate: row.progressRate,
          startDate: row.startDate,
          plannedWorkDays: row.plannedWorkDays,
          completionDate: row.completionDate,
          delayDays: row.delayDays,
        };
      });

      // 재사용되지 않은 ID만 삭제 목록에 포함
      const finalDeletedIds = Array.from(deletedByKey.values());

      const request: GoalBulkRequest = {
        upserts,
        deletedIds: finalDeletedIds,
      };

      await save(request);
      await refreshData();

      // 로컬 상태 초기화
      setLocalAdditions([]);
      setLocalEdits(new Map());
      setDeletedIds(new Set());
      setFilteredData(null);

      toast.success("저장되었습니다.");
    } catch (err) {
      console.error("Save error:", err);
      const message = err instanceof Error ? err.message : "저장에 실패했습니다.";
      toast.error(message);
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
          <Button onClick={() => refreshData()}>다시 시도</Button>
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
            <h1 className="text-lg font-semibold text-gray-900">목표 관리</h1>
            <p className="mt-1 text-sm text-gray-500">목표 관리</p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <AgGridSearchFilter
              onSearch={handleSearch}
              onReset={handleResetFilter}
              searchPlaceholder="시공구간, 진행률, 지연일 검색..."
              onDateError={(msg) => toast.warning(msg)}
            />
          </div>
          <div className="flex gap-2">
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
                tooltipShowDelay={300}
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

      <div className="mt-4 flex gap-2">
        <Button onClick={handleCreate}>생성</Button>
        <Button onClick={handleDelete} variant="error">
          삭제
        </Button>
      </div>
    </div>
  );
}
