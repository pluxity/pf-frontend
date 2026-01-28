import { AgGridReact } from "ag-grid-react";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Checkbox } from "@pf-dev/ui";
import type { KeyManagementItem, KeyManagementFormData } from "./types";
import { useToastContext } from "../../contexts/ToastContext";
import { useKeyManagement } from "./hooks";
import { KeyManagementModal } from "./modals";

interface MatrixRow {
  rowIndex: number;
  [key: string]: KeyManagementItem | number | undefined;
}

export function KeyManagementPage() {
  const gridRef = useRef<AgGridReactType<MatrixRow>>(null);
  const { toast } = useToastContext();
  const [selectedItem, setSelectedItem] = useState<KeyManagementItem | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());

  const { data, types, isLoading, isError, create, update, select, deselect, remove, refreshData } =
    useKeyManagement();

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const initialSelectedCells = new Set<string>();

    data.forEach((group) => {
      group.items.forEach((item, rowIndex) => {
        if (item.selected) {
          const cellKey = `${rowIndex}_${group.type}`;
          initialSelectedCells.add(cellKey);
        }
      });
    });

    setSelectedCells(initialSelectedCells);
  }, [data]);

  // KeyManagementGroup[] → MatrixRow[] 변환
  const matrixData = useMemo<MatrixRow[]>(() => {
    if (!data || data.length === 0) return [];

    // 각 그룹의 items를 displayOrder로 정렬
    const sortedData = data.map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => {
        const orderDiff = a.displayOrder - b.displayOrder;
        if (orderDiff !== 0) return orderDiff;
        return a.id - b.id;
      }),
    }));

    const maxRows = Math.max(...sortedData.map((g) => g.items.length), 15);

    // 행렬 데이터 생성
    const rows: MatrixRow[] = [];
    for (let i = 0; i < maxRows; i++) {
      const row: MatrixRow = { rowIndex: i };
      sortedData.forEach((group) => {
        if (group.items[i]) {
          row[group.type] = group.items[i];
        }
      });
      rows.push(row);
    }

    return rows;
  }, [data]);

  // 제목 클릭 핸들러 (모달 열기)
  const handleTitleClick = useCallback((item: KeyManagementItem | null, typeCode: string) => {
    if (item) {
      setSelectedItem(item);
    } else {
      // 빈 셀 클릭 시 새 항목 생성 모드
      const group = dataRef.current?.find((g) => g.type === typeCode);

      // 항상 해당 타입 그룹의 마지막 displayOrder + 1로 추가
      const nextDisplayOrder = group?.items.length
        ? Math.max(...group.items.map((item) => item.displayOrder)) + 1
        : 1;

      setSelectedItem({
        id: -1,
        type: typeCode,
        title: "",
        displayOrder: nextDisplayOrder,
        selected: false,
      } as KeyManagementItem);
    }
    setShowDialog(true);
  }, []);

  const handleCheckboxClick = useCallback(
    async (rowIndex: number, typeCode: string) => {
      const cellKey = `${rowIndex}_${typeCode}`;
      const group = dataRef.current?.find((g) => g.type === typeCode);
      const item = group?.items[rowIndex];

      if (!item) return;

      try {
        const isCurrentlySelected = selectedCells.has(cellKey);

        if (isCurrentlySelected) {
          await deselect(item.id);
        } else {
          await select(item.id);
        }

        await refreshData();
      } catch (err) {
        console.error("Checkbox toggle error:", err);
        toast.error("선택 상태 변경에 실패했습니다.");
      }
    },
    [selectedCells, select, deselect, refreshData, toast]
  );

  const cellRenderer = useCallback(
    (params: ICellRendererParams<MatrixRow>) => {
      const item = params.value as KeyManagementItem | undefined;
      const typeCode = params.colDef?.field || "";
      const rowIndex = params.data?.rowIndex ?? 0;
      const cellKey = `${rowIndex}_${typeCode}`;
      const isSelected = selectedCells.has(cellKey);

      if (!item) {
        return (
          <div className="h-full flex items-center gap-2 px-2">
            <span
              className="text-gray-400 text-xs flex-1 cursor-pointer hover:text-gray-600"
              onClick={() => handleTitleClick(null, typeCode)}
            >
              클릭하여 입력
            </span>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleCheckboxClick(rowIndex, typeCode)}
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </div>
        );
      }

      return (
        <div className="h-full flex items-center gap-2 px-2">
          <span
            className="truncate flex-1 cursor-pointer hover:text-blue-600"
            onClick={() => handleTitleClick(item, typeCode)}
          >
            {item.title}
          </span>

          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleCheckboxClick(rowIndex, typeCode)}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </div>
      );
    },
    [selectedCells, handleTitleClick, handleCheckboxClick]
  );

  const columnDefs = useMemo<ColDef<MatrixRow>[]>(() => {
    return types.map((type) => ({
      headerName: type.description,
      field: type.code as string,
      flex: 1,
      editable: false,
      cellRenderer,
      cellClass: "cursor-pointer",
      cellDataType: false,
    }));
  }, [types, cellRenderer]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: false,
      filter: false,
      resizable: true,
    }),
    []
  );

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    setSelectedItem(null);
    setShowDialog(false);
  }, []);

  // 모달 저장
  const handleSave = useCallback(
    async (formData: KeyManagementFormData, uploadedFileId: number | null) => {
      if (!selectedItem) return;

      try {
        const isNewItem = selectedItem.id < 0;
        const isEmpty = !formData.title.trim();

        if (isEmpty && !isNewItem) {
          await remove(selectedItem.id);
          toast.success("항목이 삭제되었습니다.");
          await refreshData();
          handleCloseModal();
          return;
        }

        if (isEmpty && isNewItem) {
          toast.error("제목을 입력해주세요.");
          return;
        }

        if (isNewItem) {
          await create({
            type: selectedItem.type,
            title: formData.title,
            methodFeature: formData.methodFeature,
            methodContent: formData.methodContent,
            methodDirection: formData.methodDirection,
            displayOrder: formData.displayOrder,
            fileId: uploadedFileId !== null ? uploadedFileId : selectedItem.fileId || null,
          });
          toast.success("항목이 생성되었습니다.");
        } else {
          await update({
            id: selectedItem.id,
            data: {
              type: selectedItem.type,
              title: formData.title,
              methodFeature: formData.methodFeature,
              methodContent: formData.methodContent,
              methodDirection: formData.methodDirection,
              displayOrder: formData.displayOrder,
              fileId: uploadedFileId !== null ? uploadedFileId : selectedItem.fileId || null,
            },
          });

          toast.success("항목이 수정되었습니다.");
        }

        await refreshData();

        handleCloseModal();
      } catch (err) {
        console.error("Save error:", err);
        toast.error("저장에 실패했습니다.");
      }
    },
    [selectedItem, create, update, remove, refreshData, toast, handleCloseModal]
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-red-500">데이터를 불러오는데 실패했습니다.</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">주요관리사항 관리</h1>
            <p className="mt-1 text-sm text-gray-500">
              셀을 클릭하여 상세 정보를 확인/편집할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200">
        <div className="flex-1">
          <AgGridReact
            ref={gridRef}
            rowData={matrixData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            getRowId={(params) => String(params.data.rowIndex)}
            rowHeight={46}
            headerHeight={52}
          />
        </div>
      </div>

      <KeyManagementModal
        isOpen={showDialog}
        selectedItem={selectedItem}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}
