import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import type { Permission, PermissionFormData, ResourceTypeInfo } from "../types";
import {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  getResourceTypes,
} from "../services";

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
  editingPermission: Permission | null;
  deletingPermission: Permission | null;
  deleteConfirmOpen: boolean;
  viewingPermission: Permission | null;
  detailModalOpen: boolean;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  handleCreate: () => void;
  handleEdit: (permission: Permission) => void;
  handleDelete: (permission: Permission) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleViewDetail: (permission: Permission) => void;
  handleFormSubmit: (data: PermissionFormData) => Promise<void>;
  handleSearch: (query: string) => void;
  setFormModalOpen: (open: boolean) => void;
  setDeleteConfirmOpen: (open: boolean) => void;
  setDetailModalOpen: (open: boolean) => void;
  mutatePermissions: () => void;
}

export function usePermissions(): UsePermissionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [viewingPermission, setViewingPermission] = useState<Permission | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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
    setEditingPermission(null);
    setFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((permission: Permission) => {
    setEditingPermission(permission);
    setFormModalOpen(true);
  }, []);

  const handleDelete = useCallback((permission: Permission) => {
    setDeletingPermission(permission);
    setDeleteConfirmOpen(true);
  }, []);

  const handleViewDetail = useCallback((permission: Permission) => {
    setViewingPermission(permission);
    setDetailModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingPermission) return;

    setIsLoading(true);
    try {
      await deletePermission(deletingPermission.id);
      await mutatePermissions(
        permissions.filter((p) => p.id !== deletingPermission.id),
        false
      );
      setDeleteConfirmOpen(false);
      setDeletingPermission(null);
    } catch (error) {
      console.error("Failed to delete permission:", error);
    } finally {
      setIsLoading(false);
    }
  }, [deletingPermission, permissions, mutatePermissions]);

  const handleFormSubmit = useCallback(
    async (data: PermissionFormData) => {
      setIsLoading(true);
      try {
        if (editingPermission) {
          await updatePermission(editingPermission.id, data);
        } else {
          await createPermission(data);
        }
        await mutatePermissions();
        setFormModalOpen(false);
        setEditingPermission(null);
      } catch (error) {
        console.error("Failed to save permission:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [editingPermission, mutatePermissions]
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
    editingPermission,
    deletingPermission,
    deleteConfirmOpen,
    viewingPermission,
    detailModalOpen,
    setSearchQuery,
    setCurrentPage,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteConfirm,
    handleViewDetail,
    handleFormSubmit,
    handleSearch,
    setFormModalOpen,
    setDeleteConfirmOpen,
    setDetailModalOpen,
    mutatePermissions: () => mutatePermissions(),
  };
}
