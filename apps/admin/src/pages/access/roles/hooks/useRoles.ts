import { useState, useMemo, useCallback, useEffect } from "react";
import type { Role, RoleFormData, Permission } from "../types";
import { getRoles, createRole, getPermissions } from "../services";

const ITEMS_PER_PAGE = 10;

export interface UseRolesReturn {
  roles: Role[];
  filteredRoles: Role[];
  paginatedRoles: Role[];
  totalPages: number;
  isLoading: boolean;
  availablePermissions: Permission[];
  searchQuery: string;
  currentPage: number;
  formModalOpen: boolean;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  handleCreate: () => void;
  handleFormSubmit: (data: RoleFormData) => Promise<void>;
  handleSearch: (query: string) => void;
  setFormModalOpen: (open: boolean) => void;
}

export function useRoles(): UseRolesReturn {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formModalOpen, setFormModalOpen] = useState(false);

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

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (role.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [roles, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRoles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRoles, currentPage]);

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
    roles,
    filteredRoles,
    paginatedRoles,
    totalPages,
    isLoading: isLoading || isInitialLoading,
    availablePermissions,
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
