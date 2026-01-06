/**
 * 사용자 CRUD 훅
 *
 * 사용자 목록 조회, 생성, 수정, 삭제 및 필터링을 관리합니다.
 * DataTable과 함께 사용하며, 페이지네이션은 DataTable 내부에서 처리됩니다.
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import type { User, UserFormData, FilterStatus } from "../types";
import { getUsers, updateUser, deleteUser, deleteUsers } from "../services";

export interface UseUsersReturn {
  // 데이터
  users: User[];
  filteredUsers: User[];
  isLoading: boolean;

  // 필터 상태
  searchQuery: string;
  filterStatus: FilterStatus;

  // 선택 상태
  selectedUsers: User[];

  // 모달 상태
  editModalOpen: boolean;
  deleteDialogOpen: boolean;
  selectedUser: User | null;

  // 필터 액션
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: FilterStatus) => void;

  // 선택 액션
  setSelectedUsers: (users: User[]) => void;

  // CRUD 핸들러
  handleEdit: (user: User) => void;
  handleDelete: (user: User) => void;
  handleBulkDelete: () => void;
  handleEditSubmit: (data: UserFormData) => Promise<void>;
  handleDeleteConfirm: () => Promise<void>;

  // 모달 제어
  setEditModalOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
}

export function useUsers(): UseUsersReturn {
  // 데이터 상태
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // 선택 상태
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  // 모달 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const loadUsers = async () => {
      setIsInitialLoading(true);
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadUsers();
  }, []);

  // 필터링된 사용자
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, filterStatus]);

  // CRUD 핸들러
  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  }, []);

  const handleBulkDelete = useCallback(() => {
    setSelectedUser(null);
    setDeleteDialogOpen(true);
  }, []);

  const handleEditSubmit = useCallback(
    async (data: UserFormData) => {
      if (!selectedUser) return;

      setIsLoading(true);
      try {
        const updated = await updateUser(selectedUser.id, data);
        setUsers((prev) => prev.map((user) => (user.id === selectedUser.id ? updated : user)));
        setEditModalOpen(false);
        setSelectedUser(null);
      } catch (error) {
        console.error("Failed to update user:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedUser]
  );

  const handleDeleteConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      if (selectedUser) {
        // 단건 삭제
        await deleteUser(selectedUser.id);
        setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
      } else if (selectedUsers.length > 0) {
        // 일괄 삭제
        const ids = selectedUsers.map((user) => user.id);
        await deleteUsers(ids);
        const idSet = new Set(ids);
        setUsers((prev) => prev.filter((user) => !idSet.has(user.id)));
        setSelectedUsers([]);
      }
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to delete user(s):", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser, selectedUsers]);

  return {
    // 데이터
    users,
    filteredUsers,
    isLoading: isLoading || isInitialLoading,

    // 필터 상태
    searchQuery,
    filterStatus,

    // 선택 상태
    selectedUsers,

    // 모달 상태
    editModalOpen,
    deleteDialogOpen,
    selectedUser,

    // 필터 액션
    setSearchQuery,
    setFilterStatus: (status: FilterStatus) => {
      setFilterStatus(status);
    },

    // 선택 액션
    setSelectedUsers,

    // CRUD 핸들러
    handleEdit,
    handleDelete,
    handleBulkDelete,
    handleEditSubmit,
    handleDeleteConfirm,

    // 모달 제어
    setEditModalOpen,
    setDeleteDialogOpen,
  };
}
