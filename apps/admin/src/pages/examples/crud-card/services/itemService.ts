import type { Item, ItemFormData } from "../types";

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

const MOCK_DELAY = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getItems(): Promise<Item[]> {
  await delay(MOCK_DELAY);
  return [...MOCK_ITEMS];
}

export async function createItem(data: ItemFormData): Promise<Item> {
  await delay(MOCK_DELAY);
  const newItem: Item = {
    id: `item-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return newItem;
}

export async function updateItem(id: string, data: ItemFormData): Promise<Item> {
  await delay(MOCK_DELAY);
  const updatedItem: Item = {
    id,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return updatedItem;
}

export async function deleteItem(_id: string): Promise<void> {
  await delay(MOCK_DELAY);
}
