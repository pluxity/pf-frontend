/**
 * User API 서비스
 *
 * TODO: 실제 API 엔드포인트로 교체
 * - baseUrl, endpoints 수정
 * - 인증 헤더 추가 필요시 axios instance 사용
 */

import type { User, UserFormData } from "../types";

// ============================================================================
// Mock 데이터 (실제 사용 시 제거)
// ============================================================================

const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Sales", "HR"];
const ROLES = ["Developer", "Designer", "Manager", "Analyst", "Specialist", "Lead", "Intern"];
const STATUSES: User["status"][] = ["active", "inactive", "pending"];
const NAMES = [
  "김철수",
  "이영희",
  "박지성",
  "최민수",
  "정수연",
  "강민지",
  "윤서준",
  "임하늘",
  "한지민",
  "오준혁",
  "서예진",
  "조은우",
];

const MOCK_USERS: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: NAMES[i % NAMES.length]!,
  email: `user${i + 1}@example.com`,
  department: DEPARTMENTS[i % DEPARTMENTS.length]!,
  role: ROLES[i % ROLES.length]!,
  status: STATUSES[i % 3]!,
  joinDate: new Date(Date.now() - i * 30 * 86400000).toISOString().split("T")[0] ?? "",
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
 */
export async function getUsers(): Promise<User[]> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch('/api/users');
  // return response.json();

  await delay(MOCK_DELAY);
  return [...MOCK_USERS];
}

/**
 * 사용자 단건 조회
 */
export async function getUser(id: string): Promise<User | null> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch(`/api/users/${id}`);
  // return response.json();

  await delay(MOCK_DELAY);
  return MOCK_USERS.find((user) => user.id === id) ?? null;
}

/**
 * 사용자 생성
 */
export async function createUser(data: UserFormData): Promise<User> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch('/api/users', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // return response.json();

  await delay(MOCK_DELAY);
  const newUser: User = {
    id: `user-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return newUser;
}

/**
 * 사용자 수정
 */
export async function updateUser(id: string, data: UserFormData): Promise<User> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch(`/api/users/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // return response.json();

  await delay(MOCK_DELAY);
  const updatedUser: User = {
    id,
    ...data,
    createdAt: new Date().toISOString(), // 실제로는 서버에서 유지
    updatedAt: new Date().toISOString(),
  };
  return updatedUser;
}

/**
 * 사용자 삭제
 */
export async function deleteUser(_id: string): Promise<void> {
  // TODO: 실제 API 호출로 교체
  // await fetch(`/api/users/${_id}`, { method: 'DELETE' });

  await delay(MOCK_DELAY);
  // Mock: 아무것도 안 함
}

/**
 * 사용자 일괄 삭제
 */
export async function deleteUsers(_ids: string[]): Promise<void> {
  // TODO: 실제 API 호출로 교체
  // await fetch('/api/users/bulk-delete', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ids }),
  // });

  await delay(MOCK_DELAY);
  // Mock: 아무것도 안 함
}
