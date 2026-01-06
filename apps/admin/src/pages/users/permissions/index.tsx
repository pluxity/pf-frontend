/**
 * 권한 관리 페이지
 *
 * 권한 목록 조회 및 생성 기능을 제공합니다.
 */

import { Button, Plus } from "@pf-dev/ui/atoms";
import { SearchBar, Pagination } from "@pf-dev/ui/molecules";
import { PermissionTable, PermissionFormModal } from "./components";
import { usePermissions } from "./hooks";

export function PermissionsPage() {
  const {
    // 데이터
    filteredPermissions,
    paginatedPermissions,
    totalPages,
    isLoading,

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
  } = usePermissions();

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">권한 관리</h1>
          <p className="mt-1 text-sm text-gray-500">총 {filteredPermissions.length}개의 권한</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size="sm" />
          <span className="ml-1">새 권한</span>
        </Button>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <SearchBar
          placeholder="권한명 또는 설명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          onClear={() => handleSearch("")}
          className="w-80"
        />
      </div>

      {/* 테이블 */}
      <div className="min-h-0 flex-1 overflow-auto">
        {paginatedPermissions.length > 0 ? (
          <PermissionTable permissions={paginatedPermissions} />
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
      <PermissionFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
