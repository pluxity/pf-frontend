import { AgGridReact } from "ag-grid-react";
import type { AgGridReact as AgGridReactType } from "ag-grid-react";
import type {
  ColDef,
  ICellRendererParams,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
} from "ag-grid-community";
import { useRef, useState, useMemo } from "react";
import {
  Badge,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  Spinner,
} from "@pf-dev/ui";
import type { Notice, NoticeFormData } from "./types";
import { useToastContext } from "../../contexts/ToastContext";
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotice } from "./hooks";
import { NoticeModal } from "./components";
import { AgGridPagination, AgGridSearchFilter } from "../../components";
import type { SearchFilters } from "../../components";

interface ConfirmModalState {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
}

export function NoticePage() {
  const gridRef = useRef<AgGridReactType<Notice>>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const { toast } = useToastContext();
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState | null>(null);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({ search: "", startDate: "", endDate: "" });

  const { notices, isLoading, isError, mutate } = useNotices();
  const { createNotice, isCreating } = useCreateNotice();
  const { updateNotice, isUpdating } = useUpdateNotice();
  const { deleteNotice, isDeleting } = useDeleteNotice();

  const filteredNotices = useMemo(() => {
    if (!notices || notices.length === 0) return [];

    return notices.filter((notice) => {
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const titleMatch = (notice.title || "").toLowerCase().includes(query);
        const contentMatch = (notice.content || "").toLowerCase().includes(query);
        if (!titleMatch && !contentMatch) return false;
      }

      return true;
    });
  }, [notices, filters]);

  const onGridReady = (event: GridReadyEvent<Notice>) => {
    setGridApi(event.api);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR");
  };

  const handleRowClicked = (event: RowClickedEvent<Notice>) => {
    if (event.data) {
      setSelectedNotice(event.data);
      setShowModal(true);
    }
  };

  const columnDefs = useMemo<ColDef<Notice>[]>(() => {
    const formatDateRange = (startDate: string, endDate: string, isAlways: boolean) => {
      if (isAlways) return "상시";
      return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
    };

    const statusRenderer = (params: ICellRendererParams<Notice>) => {
      const isVisible = params.data?.isVisible ?? false;
      return (
        <Badge variant={isVisible ? "primary" : "default"}>{isVisible ? "노출" : "미노출"}</Badge>
      );
    };

    const titleRenderer = (params: ICellRendererParams<Notice>) => {
      return <>{params.data?.title || "-"}</>;
    };

    return [
      {
        headerName: "번호",
        field: "id",
        width: 80,
        sortable: true,
        comparator: (a: number, b: number) => b - a,
      },
      {
        headerName: "제목",
        field: "title",
        flex: 2,
        cellRenderer: titleRenderer,
      },
      {
        headerName: "게시기간",
        field: "startDate",
        flex: 1.5,
        cellRenderer: (params: ICellRendererParams<Notice>) =>
          formatDateRange(
            params.data?.startDate || "",
            params.data?.endDate || "",
            params.data?.isAlways ?? false
          ),
        sortable: false,
      },
      {
        headerName: "상태",
        field: "isVisible",
        width: 100,
        cellRenderer: statusRenderer,
        sortable: true,
        cellStyle: { display: "flex", alignItems: "center", justifyContent: "center" },
      },
      {
        headerName: "등록일",
        field: "createdAt",
        width: 120,
        cellRenderer: (params: ICellRendererParams<Notice>) =>
          formatDate(params.data?.createdAt || ""),
        sortable: true,
      },
      {
        headerName: "등록자",
        field: "createdBy",
        width: 100,
        sortable: true,
      },
    ];
  }, []);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: false,
      filter: false,
      resizable: true,
    }),
    []
  );

  const handleAddNotice = () => {
    setSelectedNotice(null);
    setShowModal(true);
  };

  const handleDeleteNotices = () => {
    const selectedRows = gridRef.current?.api.getSelectedRows();

    if (!selectedRows || selectedRows.length === 0) {
      toast.error("삭제할 항목을 선택해주세요.");
      return;
    }

    setConfirmModal({
      title: "공지사항 삭제",
      description: `${selectedRows.length}개의 공지사항을 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedRows.map((row) => deleteNotice(row.id)));
          toast.success("삭제되었습니다.");
        } catch (err) {
          console.error("Delete error:", err);
          toast.error("삭제 중 오류가 발생했습니다.");
        }
      },
    });
  };

  const handleCloseModal = () => {
    setSelectedNotice(null);
    setShowModal(false);
  };

  const handleSave = async (formData: NoticeFormData) => {
    try {
      if (selectedNotice) {
        await updateNotice({ id: selectedNotice.id, data: formData });
        await mutate();
        toast.success("수정되었습니다.");
      } else {
        await createNotice(formData);
        await mutate();
        toast.success("등록되었습니다.");
      }

      handleCloseModal();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("저장 중 오류가 발생했습니다.");
    }
  };

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({ search: "", startDate: "", endDate: "" });
  };

  const handleConfirm = async () => {
    try {
      setIsConfirmLoading(true);
      await confirmModal?.onConfirm();
      setConfirmModal(null);
    } finally {
      setIsConfirmLoading(false);
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
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p className="text-gray-700">데이터를 불러오는데 실패했습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">공지사항 관리</h1>
            <p className="mt-1 text-sm text-gray-500">공지사항을 관리합니다.</p>
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <AgGridSearchFilter
          onSearch={handleSearch}
          onReset={handleReset}
          searchPlaceholder="제목 또는 내용으로 검색하세요."
          showDateRange={false}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-gray-200">
        {filteredNotices.length === 0 ? (
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
              <p>{filters.search ? "검색 결과가 없습니다." : "공지사항이 없습니다."}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1">
              <AgGridReact
                ref={gridRef}
                rowData={filteredNotices}
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
                onRowClicked={handleRowClicked}
                getRowId={(params) => String(params.data.id)}
              />
            </div>
            <AgGridPagination api={gridApi} pageSizeOptions={[10, 20, 50, 100]} />
          </>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleAddNotice}>등록</Button>
        <Button onClick={handleDeleteNotices} variant="error">
          삭제
        </Button>
      </div>

      <NoticeModal
        open={showModal}
        onOpenChange={setShowModal}
        selectedNotice={selectedNotice}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
      />

      {confirmModal && (
        <Modal open={confirmModal !== null} onOpenChange={(open) => !open && setConfirmModal(null)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{confirmModal.title}</ModalTitle>
              <ModalDescription>{confirmModal.description}</ModalDescription>
            </ModalHeader>
            <ModalFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmModal(null)}
                disabled={isConfirmLoading}
              >
                취소
              </Button>
              <Button onClick={handleConfirm} disabled={isConfirmLoading || isDeleting}>
                {isConfirmLoading ? "처리 중..." : "확인"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
