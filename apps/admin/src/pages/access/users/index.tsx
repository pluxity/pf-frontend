import { SearchBar, Pagination } from "@pf-dev/ui/molecules";
import { UserTable, RoleEditModal, PasswordResetDialog } from "./components";
import { useUsers } from "./hooks";

export function UserAccountsPage() {
  const {
    filteredUsers,
    paginatedUsers,
    totalPages,
    isLoading,
    availableRoles,
    searchQuery,
    currentPage,
    roleModalOpen,
    passwordResetDialogOpen,
    selectedUser,
    setSearchQuery,
    setCurrentPage,
    handleEditRoles,
    handleResetPassword,
    handleRolesSubmit,
    handlePasswordResetConfirm,
    handleSearch,
    setRoleModalOpen,
    setPasswordResetDialogOpen,
  } = useUsers();

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">계정 관리</h1>
        <p className="mt-1 text-sm text-gray-500">총 {filteredUsers.length}명의 사용자</p>
      </div>

      <div className="mb-6">
        <SearchBar
          placeholder="이름 또는 이메일로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          onClear={() => handleSearch("")}
          className="w-80"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {paginatedUsers.length > 0 ? (
          <UserTable
            users={paginatedUsers}
            onEditRoles={handleEditRoles}
            onResetPassword={handleResetPassword}
          />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-400">{isLoading ? "로딩 중..." : "검색 결과가 없습니다."}</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <RoleEditModal
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        user={selectedUser}
        availableRoles={availableRoles}
        onSubmit={handleRolesSubmit}
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
