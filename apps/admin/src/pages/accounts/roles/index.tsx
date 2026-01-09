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
import { RoleTable, RoleFormModal } from "./components";
import { useRoles } from "./hooks";

export function RolesPage() {
  const {
    filteredRoles,
    paginatedRoles,
    totalPages,
    isLoading,
    isInitialLoading,
    error,
    availablePermissions,
    searchQuery,
    currentPage,
    formModalOpen,
    editingRole,
    deleteConfirmOpen,
    deletingRole,
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
    mutateRoles,
  } = useRoles();

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
          description="역할 데이터를 불러오는 중 오류가 발생했습니다."
          action={{ label: "다시 시도", onClick: mutateRoles }}
        />
      );
    }

    if (paginatedRoles.length === 0) {
      return searchQuery ? (
        <EmptyState
          variant="no-results"
          action={{ label: "검색 초기화", onClick: () => handleSearch("") }}
        />
      ) : (
        <EmptyState variant="no-data" action={{ label: "새 역할 추가", onClick: handleCreate }} />
      );
    }

    return <RoleTable roles={paginatedRoles} onEdit={handleEdit} onDelete={handleDelete} />;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">역할 관리</h1>
          <p className="mt-1 text-sm text-gray-500">총 {filteredRoles.length}개의 역할</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size="sm" />
          <span className="ml-1">새 역할</span>
        </Button>
      </div>

      <div className="mb-6">
        <SearchBar
          placeholder="역할명 또는 설명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          onClear={() => handleSearch("")}
          className="w-80"
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

      <RoleFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        availablePermissions={availablePermissions}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        editingRole={editingRole}
      />

      {/* 삭제 확인 모달 */}
      <Modal open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle className="text-center font-bold">역할 삭제</ModalTitle>
            <ModalDescription className="text-center">
              정말로 이 역할을 삭제하시겠습니까?
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            {deletingRole && (
              <div className="rounded-lg bg-gray-50 p-4 text-center">
                <p className="font-medium text-gray-900">{deletingRole.name}</p>
                {deletingRole.description && (
                  <p className="mt-1 text-sm text-gray-500">{deletingRole.description}</p>
                )}
              </div>
            )}
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
    </div>
  );
}
