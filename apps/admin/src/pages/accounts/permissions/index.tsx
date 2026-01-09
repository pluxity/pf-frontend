import { Button, Plus, Spinner } from "@pf-dev/ui/atoms";
import { SearchBar, Pagination } from "@pf-dev/ui/molecules";
import { EmptyState } from "@pf-dev/ui/organisms";
import { PermissionTable, PermissionFormModal } from "./components";
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
    setSearchQuery,
    setCurrentPage,
    handleCreate,
    handleFormSubmit,
    handleSearch,
    setFormModalOpen,
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

    return <PermissionTable permissions={paginatedPermissions} />;
  };

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
      />
    </div>
  );
}
