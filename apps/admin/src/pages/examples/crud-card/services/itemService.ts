/**
 * Item API 서비스
 *
 * TODO: 실제 API 엔드포인트로 교체
 * - baseUrl, endpoints 수정
 * - 인증 헤더 추가 필요시 axios instance 사용
 */

import type { Item, ItemFormData } from "../types";

// ============================================================================
// Mock 데이터 (실제 사용 시 제거)
// ============================================================================

const STATUSES: Item["status"][] = ["active", "inactive", "draft"];

const MOCK_ITEMS: Item[] = Array.from({ length: 23 }, (_, i) => ({
  id: `item-${i + 1}`,
  title: `샘플 항목 ${i + 1}`,
  description: `이것은 샘플 항목 ${i + 1}의 설명입니다. 카드형 CRUD 페이지 템플릿의 예시 데이터입니다.`,
  thumbnail: i % 3 === 0 ? `https://picsum.photos/seed/${i + 1}/400/300` : undefined,
  status: STATUSES[i % 3]!,
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
 * 아이템 목록 조회
 */
export async function getItems(): Promise<Item[]> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch('/api/items');
  // return response.json();

  await delay(MOCK_DELAY);
  return [...MOCK_ITEMS];
}

/**
 * 아이템 생성
 */
export async function createItem(data: ItemFormData): Promise<Item> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch('/api/items', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // return response.json();

  await delay(MOCK_DELAY);
  const newItem: Item = {
    id: `item-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return newItem;
}

/**
 * 아이템 수정
 */
export async function updateItem(id: string, data: ItemFormData): Promise<Item> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch(`/api/items/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(data),
  // });
  // return response.json();

  await delay(MOCK_DELAY);
  const updatedItem: Item = {
    id,
    ...data,
    createdAt: new Date().toISOString(), // 실제로는 서버에서 유지
    updatedAt: new Date().toISOString(),
  };
  return updatedItem;
}

/**
 * 아이템 삭제
 */
export async function deleteItem(_id: string): Promise<void> {
  // TODO: 실제 API 호출로 교체
  // await fetch(`/api/items/${_id}`, { method: 'DELETE' });

  await delay(MOCK_DELAY);
  // Mock: 아무것도 안 함
}
