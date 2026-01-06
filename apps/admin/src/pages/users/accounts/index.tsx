/**
 * 사용자 계정 관리 페이지
 *
 * 사용자 목록 조회, 롤 수정, 비밀번호 초기화 기능을 제공합니다.
 */

import { SearchBar, Pagination } from "@pf-dev/ui/molecules";
import { UserTable, RoleEditModal, PasswordResetDialog } from "./components";
import { useUsers } from "./hooks";

export function UserAccountsPage() {
  const {
    // 데이터
    filteredUsers,
    paginatedUsers,
    totalPages,
    isLoading,
    availableRoles,

    // 필터/페이지네이션 상태
    searchQuery,
    currentPage,

    // 모달 상태
    roleModalOpen,
    passwordResetDialogOpen,
    selectedUser,

    // 액션
    setSearchQuery,
    setCurrentPage,

    // 핸들러
    handleEditRoles,
    handleResetPassword,
    handleRolesSubmit,
    handlePasswordResetConfirm,
    handleSearch,

    // 모달 제어
    setRoleModalOpen,
    setPasswordResetDialogOpen,
  } = useUsers();

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">계정 관리</h1>
        <p className="mt-1 text-sm text-gray-500">총 {filteredUsers.length}명의 사용자</p>
      </div>

      {/* 검색 */}
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

      {/* 테이블 */}
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* 모달 */}
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
