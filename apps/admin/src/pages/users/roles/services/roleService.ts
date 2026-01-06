/**
 * 롤 API 서비스
 *
 * TODO: 실제 API 엔드포인트로 교체
 * - baseUrl: /roles
 * - 인증 헤더 추가 필요시 axios instance 사용
 */

import type { Role, RoleFormData, Permission } from "../types";

// ============================================================================
// Mock 데이터 (실제 사용 시 제거)
// ============================================================================

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

// Mock 지연 시간 (ms)
const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// API 함수들
// ============================================================================

/**
 * 롤 목록 조회
 * GET /roles
 */
export async function getRoles(): Promise<Role[]> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch('/roles');
  // return response.json();

  await delay(MOCK_DELAY);
  return [...MOCK_ROLES];
}

/**
 * 롤 생성
 * POST /roles
 */
export async function createRole(data: RoleFormData): Promise<Role> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch('/roles', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // return response.json();

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

/**
 * 권한 목록 조회
 * GET /permissions
 */
export async function getPermissions(): Promise<Permission[]> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch('/permissions');
  // return response.json();

  await delay(MOCK_DELAY);
  return [...MOCK_PERMISSIONS];
}
