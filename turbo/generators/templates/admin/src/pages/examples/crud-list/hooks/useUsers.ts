import { useState, useMemo, useCallback, useEffect } from "react";
import type { User, UserFormData, FilterStatus } from "../types";
import { getUsers, updateUser, deleteUser, deleteUsers } from "../services";

export interface UseUsersReturn {
  users: User[];
  filteredUsers: User[];
  isLoading: boolean;
  searchQuery: string;
  filterStatus: FilterStatus;
  selectedUsers: User[];
  editModalOpen: boolean;
  deleteDialogOpen: boolean;
  selectedUser: User | null;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: FilterStatus) => void;
  setSelectedUsers: (users: User[]) => void;
  handleEdit: (user: User) => void;
  handleDelete: (user: User) => void;
  handleBulkDelete: () => void;
  handleEditSubmit: (data: UserFormData) => Promise<void>;
  handleDeleteConfirm: () => Promise<void>;
  setEditModalOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
        await deleteUser(selectedUser.id);
        setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));
      } else if (selectedUsers.length > 0) {
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
    users,
    filteredUsers,
    isLoading: isLoading || isInitialLoading,
    searchQuery,
    filterStatus,
    selectedUsers,
    editModalOpen,
    deleteDialogOpen,
    selectedUser,
    setSearchQuery,
    setFilterStatus: (status: FilterStatus) => {
      setFilterStatus(status);
    },
    setSelectedUsers,
    handleEdit,
    handleDelete,
    handleBulkDelete,
    handleEditSubmit,
    handleDeleteConfirm,
    setEditModalOpen,
    setDeleteDialogOpen,
  };
}
