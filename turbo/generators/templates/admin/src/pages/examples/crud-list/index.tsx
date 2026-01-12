import { useNavigate } from "react-router-dom";
import { Button } from "@pf-dev/ui/atoms";
import { Plus } from "@pf-dev/ui/atoms";
import { SearchBar } from "@pf-dev/ui/molecules";
import {
  DataTable,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
} from "@pf-dev/ui/organisms";
import { getUserColumns, UserForm, DeleteConfirmDialog } from "./components";
import { useUsers } from "./hooks";
import type { FilterStatus } from "./types";

const STATUS_LABELS: Record<FilterStatus, string> = {
  all: "전체",
  active: "활성",
  inactive: "비활성",
  pending: "대기중",
};

export function CrudListPage() {
  const navigate = useNavigate();
  const {
    filteredUsers,
    isLoading,
    searchQuery,
    filterStatus,
    selectedUsers,
    editModalOpen,
    deleteDialogOpen,
    selectedUser,
    setSearchQuery,
    setFilterStatus,
    setSelectedUsers,
    handleEdit,
    handleDelete,
    handleBulkDelete,
    handleEditSubmit,
    handleDeleteConfirm,
    setEditModalOpen,
    setDeleteDialogOpen,
  } = useUsers();

  const columns = getUserColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">리스트형 CRUD</h1>
          <p className="mt-1 text-sm text-gray-500">총 {filteredUsers.length}명의 사용자</p>
        </div>
        <Button onClick={() => navigate("/examples/crud-list/create")}>
          <Plus size="sm" />
          <span className="ml-1">새 사용자</span>
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <SearchBar
          placeholder="검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery("")}
          className="w-80"
        />
        <div className="flex gap-2">
          {(["all", "active", "inactive", "pending"] as FilterStatus[]).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {STATUS_LABELS[status]}
            </Button>
          ))}
        </div>
        {selectedUsers.length > 0 && (
          <Button variant="error" size="sm" onClick={handleBulkDelete}>
            선택 삭제 ({selectedUsers.length})
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1">
        <DataTable
          data={filteredUsers}
          columns={columns}
          selectable
          pagination
          pageSize={10}
          onSelectionChange={setSelectedUsers}
        />
      </div>

      <Modal open={editModalOpen} onOpenChange={setEditModalOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>사용자 수정</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {selectedUser && (
              <UserForm
                initialData={selectedUser}
                onSubmit={handleEditSubmit}
                onCancel={() => setEditModalOpen(false)}
                isLoading={isLoading}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={selectedUser}
        count={selectedUsers.length}
        onConfirm={handleDeleteConfirm}
        isLoading={isLoading}
      />
    </div>
  );
}

export default CrudListPage;
