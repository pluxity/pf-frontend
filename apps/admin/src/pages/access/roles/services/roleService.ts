import type { Role, RoleFormData, Permission } from "../types";

const MOCK_PERMISSIONS: Permission[] = [
  { id: 1, name: "ALL" },
  { id: 2, name: "READ" },
  { id: 3, name: "WRITE" },
  { id: 4, name: "DELETE" },
  { id: 5, name: "ADMIN" },
];

const MOCK_ROLES: Role[] = [
  {
    id: 1,
    name: "ADMIN",
    description: "시스템 관리자",
    permissions: [MOCK_PERMISSIONS[0]!],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "MANAGER",
    description: "매니저",
    permissions: [MOCK_PERMISSIONS[1]!, MOCK_PERMISSIONS[2]!],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "USER",
    description: "일반 사용자",
    permissions: [MOCK_PERMISSIONS[1]!],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    name: "VIEWER",
    description: "뷰어",
    permissions: [MOCK_PERMISSIONS[1]!],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getRoles(): Promise<Role[]> {
  await delay(MOCK_DELAY);
  return [...MOCK_ROLES];
}

export async function createRole(data: RoleFormData): Promise<Role> {
  await delay(MOCK_DELAY);
  const newRole: Role = {
    id: Date.now(),
    name: data.name,
    description: data.description,
    permissions: MOCK_PERMISSIONS.filter((p) => data.permissionIds.includes(p.id)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return newRole;
}

export async function getPermissions(): Promise<Permission[]> {
  await delay(MOCK_DELAY);
  return [...MOCK_PERMISSIONS];
}
