import { AgGridReact } from "ag-grid-react";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { useRef, useState, useMemo, useCallback } from "react";
import { Checkbox, Button } from "@pf-dev/ui";
import type { KeyManagementItem, KeyManagementFormData, ConfirmDialogProps } from "./types";
import { useToastContext } from "../../contexts/ToastContext";
import { useKeyManagement } from "./hooks";
import { KeyManagementModal, ConfirmDialog } from "./modals";

interface MatrixRow {
  rowIndex: number;
  [key: string]: KeyManagementItem | number | undefined;
}

export function KeyManagementPage() {
  const gridRef = useRef<AgGridReactType<MatrixRow>>(null);
  const { toast } = useToastContext();
  const [selectedItem, setSelectedItem] = useState<KeyManagementItem | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogProps | null>(null);

  const { data, types, isLoading, isError, create, update, select, deselect, remove, mutate } =
    useKeyManagement();

  // 모든 고유한 displayOrder 수집
  const allDisplayOrders = useMemo<Set<number>>(() => {
    const orders = new Set<number>();
    data?.forEach((group) => group.items.forEach((item) => orders.add(item.displayOrder)));
    return orders;
  }, [data]);

  // KeyManagementGroup[] → MatrixRow[] 변환
  const matrixData = useMemo<MatrixRow[]>(() => {
    if (!data || data.length === 0) return [];

    const sortedDisplayOrders = Array.from(allDisplayOrders).sort((a, b) => a - b);

    // displayOrder 순서대로 행 생성
    return sortedDisplayOrders.map((order, index) => {
      const row: MatrixRow = { rowIndex: index };
      data.forEach((group) => {
        const item = group.items.find((item) => item.displayOrder === order);
        if (item) {
          row[group.type] = item;
        }
      });
      return row;
    });
  }, [data, allDisplayOrders]);

  const handleTitleClick = useCallback(
    (item: KeyManagementItem | null, typeCode: string) => {
      if (item && item.title?.trim()) {
        setSelectedItem(item);
      } else {
        setSelectedItem({
          id: item?.id ?? -1,
          type: item?.type ?? typeCode,
          title: "",
          displayOrder: item?.displayOrder ?? 1,
          selected: item?.selected ?? false,
          fileId: item?.fileId,
          methodFeature: item?.methodFeature,
          methodContent: item?.methodContent,
          methodDirection: item?.methodDirection,
        });
      }
      setShowDialog(true);
    },
    [data]
  );

  const handleCheckboxClick = useCallback(
    async (item: KeyManagementItem) => {
      const nextSelected = !item.selected;

      try {
        await mutate(
          (prev) =>
            prev?.map((group) =>
              group.type !== item.type
                ? group
                : {
                    ...group,
                    items: group.items.map((index) =>
                      index.id === item.id ? { ...index, selected: nextSelected } : index
                    ),
                  }
            ),
          { revalidate: false }
        );

        toast.success(nextSelected ? "항목이 선택되었습니다." : "선택이 해제되었습니다.");

        if (nextSelected) {
          await select(item.id);
        } else {
          await deselect(item.id);
        }

        mutate();
      } catch (err) {
        console.error("Checkbox update error:", err);
        toast.error("선택 상태 변경에 실패했습니다.");
        mutate();
      }
    },
    [mutate, toast, select, deselect]
  );

  const handleAddRow = useCallback(() => {
    const nextDisplayOrder =
      allDisplayOrders.size > 0 ? Math.max(...Array.from(allDisplayOrders)) + 1 : 1;

    mutate(
      (prev) => {
        if (!prev) return prev;
        return prev.map((group) => ({
          ...group,
          items: [
            ...group.items,
            {
              id: -(Date.now() + Math.random()), // 임시 ID
              type: group.type,
              title: "",
              displayOrder: nextDisplayOrder,
              selected: false,
            },
          ],
        }));
      },
      { revalidate: false }
    );

    toast.success("새 행이 추가되었습니다.");
  }, [allDisplayOrders, mutate, toast]);

  const handleDeleteRows = useCallback(() => {
    const selectedRows = gridRef.current?.api.getSelectedRows();

    if (!selectedRows || selectedRows.length === 0) {
      toast.error("삭제할 행을 선택해주세요.");
      return;
    }

    setConfirmDialog({
      open: true,
      title: "행 삭제",
      description: `${selectedRows.length}개의 행을 삭제하시겠습니까? 각 행의 모든 항목이 삭제됩니다.`,
      onConfirm: async () => {
        const itemsToDelete: number[] = [];

        for (const row of selectedRows) {
          for (const type of types) {
            const item = row[type.code];
            if (item && typeof item !== "number") {
              itemsToDelete.push(item.id);
            }
          }
        }

        if (itemsToDelete.length === 0) return;

        try {
          await mutate(
            (prev) => {
              if (!prev) return prev;
              return prev.map((group) => ({
                ...group,
                items: group.items.filter((item) => !itemsToDelete.includes(item.id)),
              }));
            },
            { revalidate: false }
          );

          toast.success("선택된 행이 삭제되었습니다.");

          await Promise.all(itemsToDelete.filter((id) => id > 0).map((id) => remove(id)));

          mutate();
        } catch (err) {
          console.error("Delete rows error:", err);
          toast.error("삭제 중 오류가 발생했습니다.");
          mutate();
        }
      },
    });
  }, [types, remove, mutate, toast]);

  const cellRenderer = useCallback(
    (params: ICellRendererParams<MatrixRow>) => {
      const item = params.value as KeyManagementItem | undefined;
      const typeCode = params.colDef?.field || "";
      const isSelected = item?.selected ?? false;

      if (!item || !item.title?.trim()) {
        return (
          <div className="h-full flex items-center gap-2 px-2">
            <span
              className="text-gray-400 text-xs flex-1 cursor-pointer hover:text-gray-600"
              onClick={() => handleTitleClick(item || null, typeCode)}
            >
              클릭하여 입력
            </span>
            <Checkbox
              disabled
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
            onCheckedChange={() => handleCheckboxClick(item)}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </div>
      );
    },
    [handleTitleClick, handleCheckboxClick]
  );

  const columnDefs = useMemo<ColDef<MatrixRow>[]>(() => {
    return types.map((type) => ({
      headerName: type.description,
      field: type.code as string,
      flex: 1,
      editable: false,
      cellRenderer,
      valueFormatter: (params) => {
        const item = params.value as KeyManagementItem | undefined;
        return item?.title || "";
      },
      cellClass: "cursor-pointer",
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
  const handleCloseModal = () => {
    setSelectedItem(null);
    setShowDialog(false);
  };

  // 모달 저장
  const handleSave = useCallback(
    async (formData: KeyManagementFormData, uploadedFileId: number | null) => {
      if (!selectedItem) return;

      try {
        const isNewItem = selectedItem.id < 0;
        const isEmpty = !formData.title.trim();

        if (isEmpty) {
          if (isNewItem) {
            handleCloseModal();
            return;
          } else {
            setConfirmDialog({
              open: true,
              title: "항목 삭제",
              description: "모든 내용이 비어있습니다. 이 항목을 삭제하시겠습니까?",
              onConfirm: async () => {
                handleCloseModal(); // 확인 즉시 입력 모달 닫기
                try {
                  await remove(selectedItem.id);
                  await mutate();
                  toast.success("항목이 삭제되었습니다.");
                } catch (err) {
                  console.error("Delete error:", err);
                  toast.error("삭제에 실패했습니다.");
                }
              },
            });
            return;
          }
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

        await mutate();

        handleCloseModal();
      } catch (err) {
        console.error("Save error:", err);
        toast.error("저장에 실패했습니다.");
      }
    },
    [selectedItem, create, update, remove, mutate, toast, handleCloseModal]
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">주요관리사항 관리</h1>
            <p className="mt-1 text-sm text-gray-500">
              셀을 클릭하여 상세 정보를 확인/편집할 수 있습니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleAddRow}>
              행 추가
            </Button>
            <Button onClick={handleDeleteRows}>행 삭제</Button>
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
            rowSelection={{ mode: "multiRow" }}
          />
        </div>
      </div>

      <KeyManagementModal
        isOpen={showDialog}
        selectedItem={selectedItem}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      {confirmDialog && (
        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => !open && setConfirmDialog(null)}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={confirmDialog.onConfirm}
        />
      )}
    </div>
  );
}
