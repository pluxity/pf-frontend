import { useState, useMemo, useCallback, useEffect } from "react";
import type { Permission, PermissionFormData } from "../types";
import { getPermissions, createPermission } from "../services";

const ITEMS_PER_PAGE = 10;

export interface UsePermissionsReturn {
  permissions: Permission[];
  filteredPermissions: Permission[];
  paginatedPermissions: Permission[];
  totalPages: number;
  isLoading: boolean;
  searchQuery: string;
  currentPage: number;
  formModalOpen: boolean;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  handleCreate: () => void;
  handleFormSubmit: (data: PermissionFormData) => Promise<void>;
  handleSearch: (query: string) => void;
  setFormModalOpen: (open: boolean) => void;
}

export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formModalOpen, setFormModalOpen] = useState(false);

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

  const filteredPermissions = useMemo(() => {
    return permissions.filter((permission) => {
      const matchesSearch =
        permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (permission.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [permissions, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPermissions.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedPermissions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPermissions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPermissions, currentPage]);

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
    permissions,
    filteredPermissions,
    paginatedPermissions,
    totalPages,
    isLoading: isLoading || isInitialLoading,
    searchQuery,
    currentPage,
    formModalOpen,
    setSearchQuery,
    setCurrentPage,
    handleCreate,
    handleFormSubmit,
    handleSearch,
    setFormModalOpen,
  };
}
