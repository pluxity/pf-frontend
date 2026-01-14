import { SearchBar, Pagination } from "@pf-dev/ui/molecules";
import { Button, Spinner, Plus } from "@pf-dev/ui/atoms";
import { EmptyState } from "@pf-dev/ui/organisms";
import { UserTable, UserFormModal, UserDeleteDialog, PasswordResetDialog } from "./components";
import { useUsers } from "./hooks";

export function UserAccountsPage() {
  const {
    filteredUsers,
    paginatedUsers,
    totalPages,
    isLoading,
    isInitialLoading,
    error,
    formError,
    availableRoles,
    searchQuery,
    currentPage,
    userFormModalOpen,
    deleteDialogOpen,
    passwordResetDialogOpen,
    selectedUser,
    setSearchQuery,
    setCurrentPage,
    handleCreate,
    handleEdit,
    handleDelete,
    handleResetPassword,
    handleCreateSubmit,
    handleUpdateSubmit,
    handleDeleteConfirm,
    handlePasswordResetConfirm,
    handleSearch,
    setUserFormModalOpen,
    setDeleteDialogOpen,
    setPasswordResetDialogOpen,
    mutateUsers,
  } = useUsers();

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
          description="사용자 데이터를 불러오는 중 오류가 발생했습니다."
          action={{ label: "다시 시도", onClick: mutateUsers }}
        />
      );
    }

    if (paginatedUsers.length === 0) {
      return searchQuery ? (
        <EmptyState
          variant="no-results"
          action={{ label: "검색 초기화", onClick: () => handleSearch("") }}
        />
      ) : (
        <EmptyState variant="no-data" />
      );
    }

    return (
      <UserTable
        users={paginatedUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
      />
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">계정 관리</h1>
            <p className="mt-1 text-sm text-gray-500">총 {filteredUsers.length}명의 사용자</p>
          </div>
          <Button onClick={handleCreate} className="w-full sm:w-auto">
            <Plus size="sm" className="mr-1" />
            사용자 등록
          </Button>
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <SearchBar
          placeholder="이름 또는 아이디로 검색..."
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

      <UserFormModal
        open={userFormModalOpen}
        onOpenChange={setUserFormModalOpen}
        user={selectedUser}
        availableRoles={availableRoles}
        onCreate={handleCreateSubmit}
        onUpdate={handleUpdateSubmit}
        isLoading={isLoading}
        error={formError}
      />

      <UserDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={selectedUser}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />

      <PasswordResetDialog
        open={passwordResetDialogOpen}
        onOpenChange={setPasswordResetDialogOpen}
        user={selectedUser}
        onConfirm={handlePasswordResetConfirm}
        isLoading={isLoading}
      />
    </div>
  );
}
