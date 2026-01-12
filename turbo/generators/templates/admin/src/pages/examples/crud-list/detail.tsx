import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Badge, ChevronLeft } from "@pf-dev/ui/atoms";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from "@pf-dev/ui/organisms";
import { UserForm, DeleteConfirmDialog } from "./components";
import { getUser, updateUser, deleteUser } from "./services";
import type { User, UserFormData } from "./types";
import { STATUS_COLORS, STATUS_LABELS } from "./types";

export function CrudListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await getUser(id);
        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleEditSubmit = async (data: UserFormData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updated = await updateUser(user.id, data);
      setUser(updated);
      setEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await deleteUser(user.id);
      navigate("/examples/crud-list");
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsSaving(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <div className="flex h-64 items-center justify-center rounded-lg border bg-gray-50">
          <div className="text-center">
            <p className="text-gray-500">사용자를 찾을 수 없습니다.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/examples/crud-list")}
            >
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/examples/crud-list")}>
            <ChevronLeft size="sm" />
            <span className="ml-1">목록으로</span>
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">사용자 상세</h1>
            <p className="mt-1 text-sm text-gray-500">사용자 정보를 확인하고 관리할 수 있습니다.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditModalOpen(true)}>
            수정
          </Button>
          <Button variant="error" onClick={() => setDeleteDialogOpen(true)}>
            삭제
          </Button>
        </div>
      </div>

      {/* 사용자 정보 카드 */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold">기본 정보</h2>
        </div>
        <div className="grid grid-cols-2 gap-6 p-6">
          <div>
            <dt className="text-sm font-medium text-gray-500">이름</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">이메일</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">부서</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.department}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">직책</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.role}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">상태</dt>
            <dd className="mt-1">
              <Badge variant={STATUS_COLORS[user.status]}>{STATUS_LABELS[user.status]}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">입사일</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.joinDate}</dd>
          </div>
        </div>
      </div>

      {/* 수정 모달 */}
      <Modal open={editModalOpen} onOpenChange={setEditModalOpen}>
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>사용자 수정</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <UserForm
              initialData={user}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditModalOpen(false)}
              isLoading={isSaving}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={user}
        onConfirm={handleDeleteConfirm}
        isLoading={isSaving}
      />
    </div>
  );
}

export default CrudListDetailPage;
