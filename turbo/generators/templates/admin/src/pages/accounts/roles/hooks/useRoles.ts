import { useState, useMemo, useCallback } from "react";
import useSWR from "swr";
import type { Role, RoleFormData, Permission } from "../types";
import { getRoles, createRole, updateRole, deleteRole, getPermissions } from "../services";

const ITEMS_PER_PAGE = 10;

export interface UseRolesReturn {
  roles: Role[];
  filteredRoles: Role[];
  paginatedRoles: Role[];
  totalPages: number;
  isLoading: boolean;
  isInitialLoading: boolean;
  error: Error | undefined;
  availablePermissions: Permission[];
  searchQuery: string;
  currentPage: number;
  formModalOpen: boolean;
  editingRole: Role | null;
  deleteConfirmOpen: boolean;
  deletingRole: Role | null;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  handleCreate: () => void;
  handleEdit: (role: Role) => void;
  handleDelete: (role: Role) => void;
  handleDeleteConfirm: () => Promise<void>;
  handleFormSubmit: (data: RoleFormData) => Promise<void>;
  handleSearch: (query: string) => void;
  setFormModalOpen: (open: boolean) => void;
  setDeleteConfirmOpen: (open: boolean) => void;
  mutateRoles: () => void;
}

export function useRoles(): UseRolesReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const {
    data: roles = [],
    error: rolesError,
    isLoading: rolesLoading,
    mutate: mutateRoles,
  } = useSWR("roles-page", getRoles, {
    revalidateOnFocus: false,
  });

  const {
    data: availablePermissions = [],
    error: permissionsError,
    isLoading: permissionsLoading,
  } = useSWR("permissions-for-roles", getPermissions, {
    revalidateOnFocus: false,
  });

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesSearch =
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (role.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      return matchesSearch;
    });
  }, [roles, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / ITEMS_PER_PAGE));

  const paginatedRoles = useMemo(() => {
    const effectivePage = Math.min(currentPage, totalPages);
    const start = (effectivePage - 1) * ITEMS_PER_PAGE;
    return filteredRoles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRoles, currentPage, totalPages]);

  const handleCreate = useCallback(() => {
    setEditingRole(null);
    setFormModalOpen(true);
  }, []);

  const handleEdit = useCallback((role: Role) => {
    setEditingRole(role);
    setFormModalOpen(true);
  }, []);

  const handleDelete = useCallback((role: Role) => {
    setDeletingRole(role);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingRole) return;

    setIsLoading(true);
    try {
      await deleteRole(deletingRole.id);
      await mutateRoles(
        roles.filter((r) => r.id !== deletingRole.id),
        false
      );
      setDeleteConfirmOpen(false);
      setDeletingRole(null);
    } catch (error) {
      console.error("Failed to delete role:", error);
    } finally {
      setIsLoading(false);
    }
  }, [deletingRole, roles, mutateRoles]);

  const handleFormSubmit = useCallback(
    async (data: RoleFormData) => {
      setIsLoading(true);
      try {
        if (editingRole) {
          await updateRole(editingRole.id, data);
          const updatedRole: Role = {
            ...editingRole,
            name: data.name,
            description: data.description,
            permissions: availablePermissions.filter((p) => data.permissionIds.includes(p.id)),
          };
          await mutateRoles(
            roles.map((r) => (r.id === editingRole.id ? updatedRole : r)),
            false
          );
        } else {
          const newId = await createRole(data);
          const newRole: Role = {
            id: newId,
            name: data.name,
            description: data.description,
            permissions: availablePermissions.filter((p) => data.permissionIds.includes(p.id)),
          };
          await mutateRoles([newRole, ...roles], false);
        }
        setFormModalOpen(false);
        setEditingRole(null);
      } catch (error) {
        console.error("Failed to save role:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [editingRole, availablePermissions, roles, mutateRoles]
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  return {
    roles,
    filteredRoles,
    paginatedRoles,
    totalPages,
    isLoading,
    isInitialLoading: rolesLoading || permissionsLoading,
    error: rolesError || permissionsError,
    availablePermissions,
    searchQuery,
    currentPage,
    formModalOpen,
    editingRole,
    deleteConfirmOpen,
    deletingRole,
    setSearchQuery,
    setCurrentPage,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteConfirm,
    handleFormSubmit,
    handleSearch,
    setFormModalOpen,
    setDeleteConfirmOpen,
    mutateRoles: () => mutateRoles(),
  };
}
