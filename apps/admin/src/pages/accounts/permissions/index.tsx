import { Button, Plus, Spinner } from "@pf-dev/ui/atoms";
import { SearchBar, Pagination } from "@pf-dev/ui/molecules";
import {
  EmptyState,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@pf-dev/ui/organisms";
import { PermissionTable, PermissionFormModal, PermissionDetailModal } from "./components";
import { usePermissions } from "./hooks";

export function PermissionsPage() {
  const {
    filteredPermissions,
    paginatedPermissions,
    totalPages,
    isLoading,
    isInitialLoading,
    error,
    resourceTypes,
    searchQuery,
    currentPage,
    formModalOpen,
    editingPermission,
    deletingPermission,
    deleteConfirmOpen,
    viewingPermission,
    detailModalOpen,
    setSearchQuery,
    setCurrentPage,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteConfirm,
    handleFormSubmit,
    handleSearch,
    setFormModalOpen,
    setDeleteConfirmOpen,
    setDetailModalOpen,
    mutatePermissions,
  } = usePermissions();

  const renderContent = () => {
    if (isInitialLoading) {
      return (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <EmptyState
          variant="custom"
          title="데이터 로딩 실패"
          description="권한 데이터를 불러오는 중 오류가 발생했습니다."
          action={{ label: "다시 시도", onClick: mutatePermissions }}
        />
      );
    }

    if (paginatedPermissions.length === 0) {
      return searchQuery ? (
        <EmptyState
          variant="no-results"
          action={{ label: "검색 초기화", onClick: () => handleSearch("") }}
        />
      ) : (
        <EmptyState variant="no-data" action={{ label: "새 권한 추가", onClick: handleCreate }} />
      );
    }

    return (
      <PermissionTable
        permissions={paginatedPermissions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">권한 관리</h1>
            <p className="mt-1 text-sm text-gray-500">총 {filteredPermissions.length}개의 권한</p>
          </div>
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus size="sm" />
            <span className="ml-1">새 권한</span>
          </Button>
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <SearchBar
          placeholder="권한명 또는 설명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          onClear={() => handleSearch("")}
          className="w-full sm:w-80"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto">{renderContent()}</div>

      {totalPages > 1 && !isInitialLoading && !error && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <PermissionFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSubmit={handleFormSubmit}
        resourceTypes={resourceTypes}
        isLoading={isLoading}
        editingPermission={editingPermission}
      />

      <Modal open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <ModalContent className="max-w-sm">
          <ModalHeader>
            <ModalTitle className="text-center font-bold">권한 삭제</ModalTitle>
            <ModalDescription className="text-center">
              &quot;{deletingPermission?.name}&quot; 권한을 삭제하시겠습니까?
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <p className="text-center text-sm text-gray-500">이 작업은 되돌릴 수 없습니다.</p>
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button
              type="button"
              variant="error"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "삭제 중..." : "삭제"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <PermissionDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        permission={viewingPermission}
      />
    </div>
  );
}
