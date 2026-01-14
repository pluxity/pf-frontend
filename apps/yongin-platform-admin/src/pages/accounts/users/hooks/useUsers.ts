import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import type { User, Role, UserCreateData, UserUpdateData } from "../types";
import {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  deleteUser,
  initUserPassword,
} from "../services";

const ITEMS_PER_PAGE = 10;

export interface UseUsersReturn {
  users: User[];
  filteredUsers: User[];
  paginatedUsers: User[];
  totalPages: number;
  isLoading: boolean;
  isInitialLoading: boolean;
  error: Error | undefined;
  formError: string | null;
  availableRoles: Role[];
  searchQuery: string;
  currentPage: number;
  userFormModalOpen: boolean;
  deleteDialogOpen: boolean;
  passwordResetDialogOpen: boolean;
  selectedUser: User | null;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  handleCreate: () => void;
  handleEdit: (user: User) => void;
  handleDelete: (user: User) => void;
  handleResetPassword: (user: User) => void;
  handleCreateSubmit: (data: UserCreateData) => Promise<void>;
  handleUpdateSubmit: (data: UserUpdateData) => Promise<void>;
  handleDeleteConfirm: () => Promise<void>;
  handlePasswordResetConfirm: () => Promise<void>;
  handleSearch: (query: string) => void;
  setUserFormModalOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
  setPasswordResetDialogOpen: (open: boolean) => void;
  clearFormError: () => void;
  mutateUsers: () => void;
}

export function useUsers(): UseUsersReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [userFormModalOpen, setUserFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    data: users = [],
    error: usersError,
    isLoading: usersLoading,
    mutate: mutateUsers,
  } = useSWR("users", getUsers, {
    revalidateOnFocus: false,
  });

  const {
    data: availableRoles = [],
    error: rolesError,
    isLoading: rolesLoading,
  } = useSWR("roles", getRoles, {
    revalidateOnFocus: false,
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [users, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));

  const paginatedUsers = useMemo(() => {
    const effectivePage = Math.min(currentPage, totalPages);
    const start = (effectivePage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage, totalPages]);

  const handleCreate = useCallback(() => {
    setSelectedUser(null);
    setFormError(null);
    setUserFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setFormError(null);
    setUserFormModalOpen(true);
  }, []);

  const handleDelete = useCallback((user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  }, []);

  const handleResetPassword = useCallback((user: User) => {
    setSelectedUser(user);
    setPasswordResetDialogOpen(true);
  }, []);

  const handleCreateSubmit = useCallback(
    async (data: UserCreateData) => {
      setIsLoading(true);
      setFormError(null);
      try {
        await createUser(data);
        await mutateUsers();
        setUserFormModalOpen(false);
      } catch (error) {
        console.error("Failed to create user:", error);
        setFormError("사용자 등록에 실패했습니다. 다시 시도해주세요.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [mutateUsers]
  );

  const handleUpdateSubmit = useCallback(
    async (data: UserUpdateData) => {
      if (!selectedUser) return;

      setIsLoading(true);
      setFormError(null);
      try {
        await updateUser(selectedUser.id, data);
        await mutateUsers();
        setUserFormModalOpen(false);
      } catch (error) {
        console.error("Failed to update user:", error);
        setFormError("사용자 수정에 실패했습니다. 다시 시도해주세요.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedUser, mutateUsers]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      await deleteUser(selectedUser.id);
      await mutateUsers();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser, mutateUsers]);

  const handlePasswordResetConfirm = useCallback(async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      await initUserPassword(selectedUser.id);
      setPasswordResetDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to reset password:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedUser]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const clearFormError = useCallback(() => {
    setFormError(null);
  }, []);

  return {
    users,
    filteredUsers,
    paginatedUsers,
    totalPages,
    isLoading,
    isInitialLoading: usersLoading || rolesLoading,
    error: usersError || rolesError,
    formError,
    availableRoles,
    searchQuery,
    currentPage,
    userFormModalOpen,
    deleteDialogOpen,
    passwordResetDialogOpen,
    selectedUser,
    setSearchQuery,
    setCurrentPage,
    handleCreate,
    handleEdit,
    handleDelete,
    handleResetPassword,
    handleCreateSubmit,
    handleUpdateSubmit,
    handleDeleteConfirm,
    handlePasswordResetConfirm,
    handleSearch,
    setUserFormModalOpen,
    setDeleteDialogOpen,
    setPasswordResetDialogOpen,
    clearFormError,
    mutateUsers: () => mutateUsers(),
  };
}
