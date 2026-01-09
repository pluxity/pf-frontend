import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import type { Permission, PermissionFormData, ResourceTypeInfo } from "../types";
import { getPermissions, createPermission, getResourceTypes } from "../services";

const ITEMS_PER_PAGE = 10;

export interface UsePermissionsReturn {
  permissions: Permission[];
  filteredPermissions: Permission[];
  paginatedPermissions: Permission[];
  totalPages: number;
  isLoading: boolean;
  isInitialLoading: boolean;
  error: Error | undefined;
  resourceTypes: ResourceTypeInfo[];
  searchQuery: string;
  currentPage: number;
  formModalOpen: boolean;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  handleCreate: () => void;
  handleFormSubmit: (data: PermissionFormData) => Promise<void>;
  handleSearch: (query: string) => void;
  setFormModalOpen: (open: boolean) => void;
  mutatePermissions: () => void;
}

export function usePermissions(): UsePermissionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formModalOpen, setFormModalOpen] = useState(false);

  const {
    data: permissions = [],
    error: permissionsError,
    isLoading: permissionsLoading,
    mutate: mutatePermissions,
  } = useSWR("permissions-page", getPermissions, {
    revalidateOnFocus: false,
  });

  const {
    data: resourceTypes = [],
    error: resourceTypesError,
    isLoading: resourceTypesLoading,
  } = useSWR("resource-types", getResourceTypes, {
    revalidateOnFocus: false,
  });

  const filteredPermissions = useMemo(() => {
    return permissions.filter((permission) => {
      const matchesSearch =
        permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (permission.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [permissions, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPermissions.length / ITEMS_PER_PAGE));

  const paginatedPermissions = useMemo(() => {
    const effectivePage = Math.min(currentPage, totalPages);
    const start = (effectivePage - 1) * ITEMS_PER_PAGE;
    return filteredPermissions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPermissions, currentPage, totalPages]);

  const handleCreate = useCallback(() => {
    setFormModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: PermissionFormData) => {
      setIsLoading(true);
      try {
        await createPermission(data);
        await mutatePermissions();
        setFormModalOpen(false);
      } catch (error) {
        console.error("Failed to create permission:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [mutatePermissions]
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  return {
    permissions,
    filteredPermissions,
    paginatedPermissions,
    totalPages,
    isLoading,
    isInitialLoading: permissionsLoading || resourceTypesLoading,
    error: permissionsError || resourceTypesError,
    resourceTypes,
    searchQuery,
    currentPage,
    formModalOpen,
    setSearchQuery,
    setCurrentPage,
    handleCreate,
    handleFormSubmit,
    handleSearch,
    setFormModalOpen,
    mutatePermissions: () => mutatePermissions(),
  };
}
