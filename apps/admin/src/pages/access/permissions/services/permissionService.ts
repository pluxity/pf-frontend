import type { Permission, PermissionFormData } from "../types";

const MOCK_PERMISSIONS: Permission[] = [
  {
    id: 1,
    name: "ALL",
    description: "모든 권한",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "READ",
    description: "읽기 권한",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "WRITE",
    description: "쓰기 권한",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    name: "DELETE",
    description: "삭제 권한",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    name: "ADMIN",
    description: "관리자 권한",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getPermissions(): Promise<Permission[]> {
  await delay(MOCK_DELAY);
  return [...MOCK_PERMISSIONS];
}

export async function createPermission(data: PermissionFormData): Promise<Permission> {
  await delay(MOCK_DELAY);
  const newPermission: Permission = {
    id: Date.now(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return newPermission;
}
