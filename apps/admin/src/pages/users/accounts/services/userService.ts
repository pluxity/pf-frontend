/**
 * 사용자 계정 API 서비스
 *
 * TODO: 실제 API 엔드포인트로 교체
 * - baseUrl: /admin/users
 * - 인증 헤더 추가 필요시 axios instance 사용
 */

import type { User, UserRolesUpdateData, UserPasswordUpdateData, Role } from "../types";

// ============================================================================
// Mock 데이터 (실제 사용 시 제거)
// ============================================================================

const MOCK_ROLES: Role[] = [
  { id: 1, name: "ADMIN", permissions: [{ id: 1, name: "ALL" }] },
  {
    id: 2,
    name: "MANAGER",
    permissions: [
      { id: 2, name: "READ" },
      { id: 3, name: "WRITE" },
    ],
  },
  { id: 3, name: "USER", permissions: [{ id: 2, name: "READ" }] },
];

const MOCK_USERS: User[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  email: `user${i + 1}@example.com`,
  name: `사용자 ${i + 1}`,
  roles: [MOCK_ROLES[i % 3]!],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
}));

// Mock 지연 시간 (ms)
const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// API 함수들
// ============================================================================

/**
 * 사용자 목록 조회
 * GET /admin/users
 */
export async function getUsers(): Promise<User[]> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch('/admin/users');
  // return response.json();

  await delay(MOCK_DELAY);
  return [...MOCK_USERS];
}

/**
 * 사용자 상세 조회
 * GET /admin/users/:id
 */
export async function getUser(id: number): Promise<User> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch(`/admin/users/${id}`);
  // return response.json();

  await delay(MOCK_DELAY);
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * 사용자 롤 수정
 * PATCH /admin/users/:id/roles
 */
export async function updateUserRoles(id: number, data: UserRolesUpdateData): Promise<User> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch(`/admin/users/${id}/roles`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // return response.json();

  await delay(MOCK_DELAY);
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) throw new Error("User not found");

  const updatedUser: User = {
    ...user,
    roles: MOCK_ROLES.filter((r) => data.roleIds.includes(r.id)),
    updatedAt: new Date().toISOString(),
  };
  return updatedUser;
}

/**
 * 사용자 비밀번호 변경
 * PATCH /admin/users/:id/password
 */
export async function updateUserPassword(id: number, _data: UserPasswordUpdateData): Promise<void> {
  // TODO: 실제 API 호출로 교체
  // await fetch(`/admin/users/${id}/password`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });

  await delay(MOCK_DELAY);
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
}

/**
 * 사용자 비밀번호 초기화
 * PATCH /admin/users/:id/password-init
 */
export async function initUserPassword(id: number): Promise<void> {
  // TODO: 실제 API 호출로 교체
  // await fetch(`/admin/users/${id}/password-init`, {
  //   method: 'PATCH',
  // });

  await delay(MOCK_DELAY);
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) throw new Error("User not found");
}

/**
 * 사용 가능한 롤 목록 조회
 * GET /roles
 */
export async function getRoles(): Promise<Role[]> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch('/roles');
  // return response.json();

  await delay(MOCK_DELAY);
  return [...MOCK_ROLES];
}
