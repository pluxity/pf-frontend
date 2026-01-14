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
    filteredItems,
    paginatedItems,
    totalPages,
    isLoading,
    searchQuery,
    filterStatus,
    currentPage,
    formModalOpen,
    deleteDialogOpen,
    selectedItem,
    setSearchQuery,
    changeFilterStatus,
    setCurrentPage,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    handleDeleteConfirm,
    handleSearch,
    setFormModalOpen,
    setDeleteDialogOpen,
  } = useItems();

  return (
    <div className="flex h-full flex-col">
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

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

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
