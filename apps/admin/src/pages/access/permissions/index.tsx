import { Button, Plus } from "@pf-dev/ui/atoms";
import { SearchBar, Pagination } from "@pf-dev/ui/molecules";
import { PermissionTable, PermissionFormModal } from "./components";
import { usePermissions } from "./hooks";

export function PermissionsPage() {
  const {
    filteredPermissions,
    paginatedPermissions,
    totalPages,
    isLoading,
    searchQuery,
    currentPage,
    formModalOpen,
    setSearchQuery,
    setCurrentPage,
    handleCreate,
    handleFormSubmit,
    handleSearch,
    setFormModalOpen,
  } = usePermissions();

  return (
    <div className="flex h-full flex-col">
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

      <div className="min-h-0 flex-1 overflow-auto">
        {paginatedPermissions.length > 0 ? (
          <PermissionTable permissions={paginatedPermissions} />
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

      <PermissionFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
