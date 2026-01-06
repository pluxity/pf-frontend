/**
 * CRUD 카드형 페이지 예제
 *
 * 이 페이지를 복사하여 새 CRUD 페이지를 만들 수 있습니다.
 *
 * 수정이 필요한 파일:
 * 1. types.ts - 데이터 타입 정의
 * 2. services/itemService.ts - API 호출 로직
 * 3. components/ - 필요시 UI 수정
 */

import { Button } from "@pf-dev/ui/atoms";
import { Plus } from "@pf-dev/ui/atoms";
import { SearchBar, Pagination } from "@pf-dev/ui/molecules";
import { CardList } from "@pf-dev/ui/organisms";
import { ItemCard, ItemFormModal, DeleteConfirmDialog } from "./components";
import { useItems } from "./hooks";
import type { FilterStatus } from "./types";

const STATUS_LABELS: Record<FilterStatus, string> = {
  all: "전체",
  active: "활성",
  inactive: "비활성",
  draft: "초안",
};

export function CrudCardPage() {
  const {
    // 데이터
    filteredItems,
    paginatedItems,
    totalPages,
    isLoading,

    // 필터/페이지네이션 상태
    searchQuery,
    filterStatus,
    currentPage,

    // 모달 상태
    formModalOpen,
    deleteDialogOpen,
    selectedItem,

    // 액션
    setSearchQuery,
    changeFilterStatus,
    setCurrentPage,

    // CRUD 핸들러
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleDeleteConfirm,
    handleSearch,

    // 모달 제어
    setFormModalOpen,
    setDeleteDialogOpen,
  } = useItems();

  return (
    <div className="flex h-full flex-col">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">카드형 CRUD</h1>
          <p className="mt-1 text-sm text-gray-500">총 {filteredItems.length}개의 항목</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus size="sm" />
          <span className="ml-1">새 항목</span>
        </Button>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 flex items-center gap-4">
        <SearchBar
          placeholder="검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={handleSearch}
          onClear={() => handleSearch("")}
          className="w-80"
        />
        <div className="flex gap-2">
          {(["all", "active", "inactive", "draft"] as FilterStatus[]).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => changeFilterStatus(status)}
            >
              {STATUS_LABELS[status]}
            </Button>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="min-h-0 flex-1 overflow-auto">
        {paginatedItems.length > 0 ? (
          <CardList
            data={paginatedItems}
            renderCard={(item) => (
              <ItemCard item={item} onEdit={handleEdit} onDelete={handleDelete} />
            )}
            keyExtractor={(item) => item.id}
            columns={3}
            gap={24}
          />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <p className="text-gray-400">검색 결과가 없습니다.</p>
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
      <ItemFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        item={selectedItem}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        item={selectedItem}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />
    </div>
  );
}
