/**
 * 권한 API 서비스
 *
 * TODO: 실제 API 엔드포인트로 교체
 * - baseUrl: /permissions
 * - 인증 헤더 추가 필요시 axios instance 사용
 */

import type { Permission, PermissionFormData } from "../types";

// ============================================================================
// Mock 데이터 (실제 사용 시 제거)
// ============================================================================

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

// Mock 지연 시간 (ms)
const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// API 함수들
// ============================================================================

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

/**
 * 권한 생성
 * POST /permissions
 */
export async function createPermission(data: PermissionFormData): Promise<Permission> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch('/permissions', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // return response.json();

  await delay(MOCK_DELAY);
  const newPermission: Permission = {
    id: Date.now(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return newPermission;
}
