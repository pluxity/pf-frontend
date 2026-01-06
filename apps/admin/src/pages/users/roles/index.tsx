/**
 * 롤 관리 페이지
 *
 * 롤 목록 조회 및 생성 기능을 제공합니다.
 */

import { Button, Plus } from "@pf-dev/ui/atoms";
import { SearchBar, Pagination } from "@pf-dev/ui/molecules";
import { RoleTable, RoleFormModal } from "./components";
import { useRoles } from "./hooks";

export function RolesPage() {
  const {
    // 데이터
    filteredRoles,
    paginatedRoles,
    totalPages,
    isLoading,
    availablePermissions,

    // 필터/페이지네이션 상태
    searchQuery,
    currentPage,

    // 모달 상태
    formModalOpen,

    // 액션
    setSearchQuery,
    setCurrentPage,

    // 핸들러
    handleCreate,
    handleFormSubmit,
    handleSearch,

    // 모달 제어
    setFormModalOpen,
  } = useRoles();

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">롤 관리</h1>
          <p className="mt-1 text-sm text-gray-500">총 {filteredRoles.length}개의 롤</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size="sm" />
          <span className="ml-1">새 롤</span>
        </Button>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <SearchBar
          placeholder="롤명 또는 설명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          onClear={() => handleSearch("")}
          className="w-80"
        />
      </div>

      {/* 테이블 */}
      <div className="min-h-0 flex-1 overflow-auto">
        {paginatedRoles.length > 0 ? (
          <RoleTable roles={paginatedRoles} />
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
      <RoleFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        availablePermissions={availablePermissions}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
