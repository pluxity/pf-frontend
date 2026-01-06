/**
 * 사용자 계정 관리 훅
 *
 * 사용자 목록 조회 및 롤/비밀번호 관리를 담당합니다.
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import type { User, Role, UserRolesUpdateData } from "../types";
import { getUsers, getRoles, updateUserRoles, initUserPassword } from "../services";

const ITEMS_PER_PAGE = 10;

export interface UseUsersReturn {
  // 데이터
  users: User[];
  filteredUsers: User[];
  paginatedUsers: User[];
  totalPages: number;
  isLoading: boolean;
  availableRoles: Role[];

  // 필터/페이지네이션 상태
  searchQuery: string;
  currentPage: number;

  // 모달 상태
  roleModalOpen: boolean;
  passwordResetDialogOpen: boolean;
  selectedUser: User | null;

  // 액션
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;

  // 핸들러
  handleEditRoles: (user: User) => void;
  handleResetPassword: (user: User) => void;
  handleRolesSubmit: (data: UserRolesUpdateData) => Promise<void>;
  handlePasswordResetConfirm: () => Promise<void>;
  handleSearch: (query: string) => void;

  // 모달 제어
  setRoleModalOpen: (open: boolean) => void;
  setPasswordResetDialogOpen: (open: boolean) => void;
}

export function useUsers(): UseUsersReturn {
  // 데이터 상태
  const [users, setUsers] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 필터/페이지네이션 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 모달 상태
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [passwordResetDialogOpen, setPasswordResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 초기 데이터 로드
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

  // 필터링된 사용자
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [users, searchQuery]);

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));

  // 현재 페이지가 유효 범위를 벗어나면 마지막 유효 페이지로 자동 조정
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // 핸들러
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
    // 데이터
    users,
    filteredUsers,
    paginatedUsers,
    totalPages,
    isLoading: isLoading || isInitialLoading,
    availableRoles,

    // 필터/페이지네이션 상태
    searchQuery,
    currentPage,

    // 모달 상태
    roleModalOpen,
    passwordResetDialogOpen,
    selectedUser,

    // 액션
    setSearchQuery,
    setCurrentPage,

    // 핸들러
    handleEditRoles,
    handleResetPassword,
    handleRolesSubmit,
    handlePasswordResetConfirm,
    handleSearch,

    // 모달 제어
    setRoleModalOpen,
    setPasswordResetDialogOpen,
  };
}
