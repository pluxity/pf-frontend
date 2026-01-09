import { useState, useMemo, useCallback, useEffect } from "react";
import type { User, Role, UserRolesUpdateData } from "../types";
import { getUsers, getRoles, updateUserRoles, initUserPassword } from "../services";

const ITEMS_PER_PAGE = 10;

export interface UseUsersReturn {
  users: User[];
  filteredUsers: User[];
  paginatedUsers: User[];
  totalPages: number;
  isLoading: boolean;
  availableRoles: Role[];
  searchQuery: string;
  currentPage: number;
  roleModalOpen: boolean;
  passwordResetDialogOpen: boolean;
  selectedUser: User | null;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  handleEditRoles: (user: User) => void;
  handleResetPassword: (user: User) => void;
  handleRolesSubmit: (data: UserRolesUpdateData) => Promise<void>;
  handlePasswordResetConfirm: () => Promise<void>;
  handleSearch: (query: string) => void;
  setRoleModalOpen: (open: boolean) => void;
  setPasswordResetDialogOpen: (open: boolean) => void;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      try {
        const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
        setUsers(usersData);
        setAvailableRoles(rolesData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [users, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const handleEditRoles = useCallback((user: User) => {
    setSelectedUser(user);
    setRoleModalOpen(true);
  }, []);

  const handleResetPassword = useCallback((user: User) => {
    setSelectedUser(user);
    setPasswordResetDialogOpen(true);
  }, []);

  const handleRolesSubmit = useCallback(
    async (data: UserRolesUpdateData) => {
      if (!selectedUser) return;

      setIsLoading(true);
      try {
        const updated = await updateUserRoles(selectedUser.id, data);
        setUsers((prev) => prev.map((user) => (user.id === selectedUser.id ? updated : user)));
        setRoleModalOpen(false);
      } catch (error) {
        console.error("Failed to update roles:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedUser]
  );

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

  return {
    users,
    filteredUsers,
    paginatedUsers,
    totalPages,
    isLoading: isLoading || isInitialLoading,
    availableRoles,
    searchQuery,
    currentPage,
    roleModalOpen,
    passwordResetDialogOpen,
    selectedUser,
    setSearchQuery,
    setCurrentPage,
    handleEditRoles,
    handleResetPassword,
    handleRolesSubmit,
    handlePasswordResetConfirm,
    handleSearch,
    setRoleModalOpen,
    setPasswordResetDialogOpen,
  };
}
