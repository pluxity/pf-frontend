/**
 * 롤 관리 훅
 *
 * 롤 목록 조회 및 생성을 담당합니다.
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Role, RoleFormData, Permission } from "../types";
import { getRoles, createRole, getPermissions } from "../services";

const ITEMS_PER_PAGE = 10;

export interface UseRolesReturn {
  // 데이터
  roles: Role[];
  filteredRoles: Role[];
  paginatedRoles: Role[];
  totalPages: number;
  isLoading: boolean;
  availablePermissions: Permission[];

  // 필터/페이지네이션 상태
  searchQuery: string;
  currentPage: number;

  // 모달 상태
  formModalOpen: boolean;

  // 액션
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;

  // 핸들러
  handleCreate: () => void;
  handleFormSubmit: (data: RoleFormData) => Promise<void>;
  handleSearch: (query: string) => void;

  // 모달 제어
  setFormModalOpen: (open: boolean) => void;
}

export function useRoles(): UseRolesReturn {
  // 데이터 상태
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 필터/페이지네이션 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 모달 상태
  const [formModalOpen, setFormModalOpen] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      try {
        const [rolesData, permissionsData] = await Promise.all([getRoles(), getPermissions()]);
        setRoles(rolesData);
        setAvailablePermissions(permissionsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadData();
  }, []);

  // 필터링된 롤
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (role.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [roles, searchQuery]);

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / ITEMS_PER_PAGE));

  // 현재 페이지가 유효 범위를 벗어나면 마지막 유효 페이지로 자동 조정
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRoles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRoles, currentPage]);

  // 핸들러
  const handleCreate = useCallback(() => {
    setFormModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(async (data: RoleFormData) => {
    setIsLoading(true);
    try {
      const created = await createRole(data);
      setRoles((prev) => [created, ...prev]);
      setFormModalOpen(false);
    } catch (error) {
      console.error("Failed to create role:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  return {
    // 데이터
    roles,
    filteredRoles,
    paginatedRoles,
    totalPages,
    isLoading: isLoading || isInitialLoading,
    availablePermissions,

    // 필터/페이지네이션 상태
    searchQuery,
    currentPage,

    // 모달 상태
    formModalOpen,

    // 액션
    setSearchQuery,
    setCurrentPage,

    // 핸들러
    handleCreate,
    handleFormSubmit,
    handleSearch,

    // 모달 제어
    setFormModalOpen,
  };
}
