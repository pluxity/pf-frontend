import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@pf-dev/ui/molecules";
import {
  DataTable,
  type DataTableColumn,
  EmptyState,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
} from "@pf-dev/ui/organisms";
import {
  Button,
  Input,
  Label,
  Textarea,
  Plus,
  Edit,
  Close,
  MoreVertical,
  Spinner,
} from "@pf-dev/ui/atoms";
import { useToastContext } from "@/contexts";
import { useNotices, useCreateNotice, useUpdateNotice, useDeleteNotice } from "../hooks";
import type { Notice, NoticeFormData } from "../types";

const noticeSchema = z.object({
  title: z
    .string()
    .min(1, "공지사항 제목을 입력해주세요")
    .max(255, "제목은 255자 이내로 입력해주세요"),
  content: z
    .string()
    .min(1, "공지사항 내용을 입력해주세요")
    .max(1000, "내용은 1000자 이내로 입력해주세요"),
});

export function NoticeSection() {
  const { toast } = useToastContext();
  const { notices, isLoading, mutate } = useNotices();
  const { createNotice, isCreating } = useCreateNotice();
  const { updateNotice, isUpdating } = useUpdateNotice();
  const { deleteNotice, isDeleting } = useDeleteNotice();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: { title: "", content: "" },
  });

  const handleCreate = () => {
    setSelectedNotice(null);
    reset({ title: "", content: "" });
    setFormModalOpen(true);
  };

  const handleEdit = useCallback(
    (notice: Notice) => {
      setSelectedNotice(notice);
      reset({ title: notice.title, content: notice.content });
      setFormModalOpen(true);
    },
    [reset]
  );

  const handleDeleteClick = useCallback((notice: Notice) => {
    setSelectedNotice(notice);
    setDeleteDialogOpen(true);
  }, []);

  const onSubmit = async (data: NoticeFormData) => {
    try {
      if (selectedNotice) {
        await updateNotice({ id: selectedNotice.id, data });
        toast({
          title: "수정 완료",
          description: "공지사항이 수정되었습니다.",
          variant: "success",
        });
      } else {
        await createNotice(data);
        toast({
          title: "등록 완료",
          description: "공지사항이 등록되었습니다.",
          variant: "success",
        });
      }
      await mutate();
      setFormModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "저장에 실패했습니다";
      toast({
        title: "저장 실패",
        description: message,
        variant: "error",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNotice) return;

    try {
      await deleteNotice(selectedNotice.id);
      await mutate();
      toast({
        title: "삭제 완료",
        description: "공지사항이 삭제되었습니다.",
        variant: "success",
      });
      setDeleteDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "삭제에 실패했습니다";
      toast({
        title: "삭제 실패",
        description: message,
        variant: "error",
      });
    }
  };

  const columns: DataTableColumn<Notice>[] = useMemo(
    () => [
      {
        key: "title",
        header: "제목",
        className: "w-48",
        sortable: true,
      },
      {
        key: "content",
        header: "내용",
        render: (notice) => (
          <span className="line-clamp-1" title={notice.content}>
            {notice.content}
          </span>
        ),
      },
      {
        key: "updatedAt",
        header: "수정일",
        className: "w-44",
        sortable: true,
        render: (notice) => new Date(notice.updatedAt).toLocaleString("ko-KR"),
      },
      {
        key: "updatedBy",
        header: "수정자",
        className: "w-28",
      },
      {
        key: "id",
        header: "",
        className: "w-12",
        render: (notice) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical size="sm" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(notice)}>
                <Edit size="sm" className="mr-2" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteClick(notice)} className="text-red-600">
                <Close size="sm" className="mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleEdit, handleDeleteClick]
  );

  const isMutating = isCreating || isUpdating || isDeleting;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>공지사항</CardTitle>
              <CardDescription>플랫폼에 표시되는 공지사항을 관리합니다.</CardDescription>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus size="sm" className="mr-1" />
              등록
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : notices.length === 0 ? (
            <EmptyState variant="no-data" />
          ) : (
            <DataTable data={notices} columns={columns} pagination pageSize={5} />
          )}
        </CardContent>
      </Card>

      <Modal open={formModalOpen} onOpenChange={setFormModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{selectedNotice ? "공지사항 수정" : "공지사항 등록"}</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    placeholder="공지사항 제목을 입력하세요"
                    {...register("title")}
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    placeholder="공지사항 내용을 입력하세요"
                    rows={5}
                    {...register("content")}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500">{errors.content.message}</p>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setFormModalOpen(false)}>
                취소
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating ? "저장 중..." : "저장"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Modal open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>공지사항 삭제</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>"{selectedNotice?.title}" 공지사항을 삭제하시겠습니까?</p>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              취소
            </Button>
            <Button variant="error" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
