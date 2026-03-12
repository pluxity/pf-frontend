import { AgGridReact } from "ag-grid-react";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import type {
  ColDef,
  CellValueChangedEvent,
  RowClassParams,
  GridApi,
  GridReadyEvent,
} from "ag-grid-community";
import { useRef, useState, useMemo, useCallback } from "react";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  Spinner,
} from "@pf-dev/ui";
import { useToastContext } from "../../contexts/ToastContext";
import { useSafetyEquipment } from "./hooks";
import { validateSafetyEquipment } from "./validation";
import { AgGridPagination } from "../../components";
import type { SafetyEquipmentRow } from "./types";

const MAX_ROWS = 10;

interface ConfirmModalState {
  title: string;
  description: string;
  onConfirm: () => void;
}

export function SafetyEquipmentPage() {
  const gridRef = useRef<AgGridReactType<SafetyEquipmentRow>>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const { toast } = useToastContext();

  const { data, isLoading, isError, refresh, create, update, remove } = useSafetyEquipment();

  const [localAdditions, setLocalAdditions] = useState<SafetyEquipmentRow[]>([]);
  const [localEdits, setLocalEdits] = useState<Map<number, Partial<SafetyEquipmentRow>>>(new Map());
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);

  // 임시 ID 생성 (신규 행)
  const tempIdRef = useRef(-1);
  const generateTempId = () => {
    tempIdRef.current -= 1;
    return tempIdRef.current;
  };

  // 그리드 표시용 전체 데이터
  const allData = useMemo<SafetyEquipmentRow[]>(() => {
    const serverData = (data ?? [])
      .filter((row) => !deletedIds.has(row.id))
      .sort((a, b) => a.id - b.id)
      .map((row) => {
        const base: SafetyEquipmentRow = { id: row.id, name: row.name, quantity: row.quantity };
        const edits = localEdits.get(row.id);
        return edits ? { ...base, ...edits } : base;
      });

    const addedData = localAdditions.map((row) => {
      const edits = localEdits.get(row.id);
      return edits ? { ...row, ...edits } : row;
    });

    return [...serverData, ...addedData];
  }, [data, localAdditions, localEdits, deletedIds]);

  // 변경된 행
  const editedRowIds = useMemo(() => {
    const ids = new Set<number>();
    localAdditions.forEach((row) => ids.add(row.id));
    localEdits.forEach((_, id) => ids.add(id));
    return ids;
  }, [localAdditions, localEdits]);

  const totalCount = allData.length;
  const isMax = totalCount >= MAX_ROWS;
  const hasChanges = editedRowIds.size > 0 || deletedIds.size > 0;

  const onGridReady = (event: GridReadyEvent) => {
    setGridApi(event.api);
  };

  const getRowStyle = useCallback(
    (params: RowClassParams<SafetyEquipmentRow>) => {
      if (params.data && editedRowIds.has(params.data.id)) {
        return { backgroundColor: "#fef3c7" };
      }
      return undefined;
    },
    [editedRowIds]
  );

  const columnDefs = useMemo<ColDef<SafetyEquipmentRow>[]>(
    () => [
      {
        headerName: "번호",
        valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
        width: 70,
        sortable: false,
        editable: false,
        cellStyle: { textAlign: "center" },
      },
      {
        headerName: "장비명",
        field: "name",
        flex: 2,
        editable: true,
        cellEditor: "agTextCellEditor",
      },
      {
        headerName: "수량",
        field: "quantity",
        flex: 1,
        editable: true,
        cellEditor: "agNumberCellEditor",
        cellEditorParams: { precision: 0, step: 1, min: 0 },
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: false, resizable: false }), []);

  // 셀 값 변경
  const handleCellValueChanged = useCallback((event: CellValueChangedEvent<SafetyEquipmentRow>) => {
    if (!event.data) return;
    const rowId = event.data.id;
    const field = event.colDef.field as keyof SafetyEquipmentRow;

    setLocalEdits((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(rowId) ?? {};
      newMap.set(rowId, { ...existing, [field]: event.newValue });
      return newMap;
    });
  }, []);

  const handleAddRow = () => {
    if (isMax) return;
    const tempId = generateTempId();
    setLocalAdditions((prev) => [...prev, { id: tempId, name: "", quantity: 0 }]);
  };

  const handleDeleteRows = () => {
    const selectedRows = gridRef.current?.api.getSelectedRows();
    if (!selectedRows || selectedRows.length === 0) {
      toast.error("삭제할 항목을 선택해주세요.");
      return;
    }

    setConfirmModal({
      title: "안전장비 삭제",
      description: `${selectedRows.length}개의 안전장비를 삭제하시겠습니까?`,
      onConfirm: () => {
        const selectedIds = selectedRows.map((row) => row.id);

        setDeletedIds((prev) => {
          const next = new Set(prev);
          selectedIds.forEach((id) => {
            if (id > 0) next.add(id);
          });
          return next;
        });

        setLocalAdditions((prev) => prev.filter((row) => !selectedIds.includes(row.id)));

        setLocalEdits((prev) => {
          const newMap = new Map(prev);
          selectedIds.forEach((id) => newMap.delete(id));
          return newMap;
        });

        setConfirmModal(null);
      },
    });
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.error("저장할 변경 사항이 없습니다.");
      return;
    }

    const dataToSave = allData.filter((row) => editedRowIds.has(row.id));
    for (const row of dataToSave) {
      const errors = validateSafetyEquipment({ name: row.name, quantity: row.quantity });
      if (errors.length > 0) {
        toast.error(errors[0]!.message);
        return;
      }
    }

    setIsSaving(true);
    try {
      const createPromises = dataToSave
        .filter((row) => row.id < 0)
        .map((row) => create({ name: row.name, quantity: row.quantity }));
      const updatePromises = dataToSave
        .filter((row) => row.id > 0)
        .map((row) => update({ id: row.id, data: { name: row.name, quantity: row.quantity } }));
      const deletePromises = Array.from(deletedIds).map((id) => remove(id));
      await Promise.all([...createPromises, ...updatePromises, ...deletePromises]);

      setLocalAdditions([]);
      setLocalEdits(new Map());
      setDeletedIds(new Set());

      toast.success("저장되었습니다.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      await refresh();
      setIsSaving(false);
    }
  };

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

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-red-500">
            <svg
              aria-hidden="true"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-gray-700">데이터를 불러오는데 실패했습니다.</p>
          <Button onClick={() => refresh()}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">안전장비 관리</h1>
          <p className="mt-1 text-sm text-gray-500">안전장비는 최대 10개까지 등록 가능합니다.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
          {isSaving
            ? "저장 중..."
            : `저장${hasChanges ? ` (${editedRowIds.size + deletedIds.size})` : ""}`}
        </Button>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200">
        <div className="flex-1">
          <AgGridReact
            ref={gridRef}
            rowData={allData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            singleClickEdit={true}
            suppressMovableColumns={true}
            animateRows={true}
            rowSelection={{ mode: "multiRow", checkboxes: true, headerCheckbox: true }}
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
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleAddRow} disabled={isMax || isSaving}>
          등록
        </Button>
        <Button onClick={handleDeleteRows} variant="error" disabled={isSaving}>
          삭제
        </Button>
      </div>

      {confirmModal && (
        <Modal open={true} onOpenChange={(open) => !open && setConfirmModal(null)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{confirmModal.title}</ModalTitle>
              <ModalDescription>{confirmModal.description}</ModalDescription>
            </ModalHeader>
            <ModalFooter>
              <Button variant="outline" onClick={() => setConfirmModal(null)}>
                취소
              </Button>
              <Button onClick={confirmModal.onConfirm}>확인</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
