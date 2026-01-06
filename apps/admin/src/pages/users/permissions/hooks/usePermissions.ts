/**
 * 권한 관리 훅
 *
 * 권한 목록 조회 및 생성을 담당합니다.
 */

import { useState, useMemo, useCallback, useEffect } from "react";
import type { Permission, PermissionFormData } from "../types";
import { getPermissions, createPermission } from "../services";

const ITEMS_PER_PAGE = 10;

export interface UsePermissionsReturn {
  // 데이터
  permissions: Permission[];
  filteredPermissions: Permission[];
  paginatedPermissions: Permission[];
  totalPages: number;
  isLoading: boolean;

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
  handleFormSubmit: (data: PermissionFormData) => Promise<void>;
  handleSearch: (query: string) => void;

  // 모달 제어
  setFormModalOpen: (open: boolean) => void;
}

export function usePermissions(): UsePermissionsReturn {
  // 데이터 상태
  const [permissions, setPermissions] = useState<Permission[]>([]);
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
        const data = await getPermissions();
        setPermissions(data);
      } catch (error) {
        console.error("Failed to load permissions:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadData();
  }, []);

  // 필터링된 권한
  const filteredPermissions = useMemo(() => {
    return permissions.filter((permission) => {
      const matchesSearch =
        permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (permission.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [permissions, searchQuery]);

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filteredPermissions.length / ITEMS_PER_PAGE));

  // 현재 페이지가 유효 범위를 벗어나면 마지막 유효 페이지로 자동 조정
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedPermissions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPermissions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPermissions, currentPage]);

  // 핸들러
  const handleCreate = useCallback(() => {
    setFormModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(async (data: PermissionFormData) => {
    setIsLoading(true);
    try {
      const created = await createPermission(data);
      setPermissions((prev) => [created, ...prev]);
      setFormModalOpen(false);
    } catch (error) {
      console.error("Failed to create permission:", error);
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
    permissions,
    filteredPermissions,
    paginatedPermissions,
    totalPages,
    isLoading: isLoading || isInitialLoading,

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
