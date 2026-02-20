import { useState, useEffect } from "react";
import { keyManagementService } from "@/services";
import type { KeyManagementItem, KeyManagementType } from "@/services";

interface UseKeyManagementReturn {
  items: KeyManagementItem[];
  types: KeyManagementType[];
  isLoading: boolean;
  error: string | null;
  getTypeDescription: (code: string) => string;
}

/**
 * 대시보드용 선택된 주요 관리사항 데이터를 가져오는 커스텀 훅
 * @returns items, types, isLoading, error, getTypeDescription
 */
export function useKeyManagement(): UseKeyManagementReturn {
  const [items, setItems] = useState<KeyManagementItem[]>([]);
  const [types, setTypes] = useState<KeyManagementType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const [itemsData, typesData] = await Promise.all([
          keyManagementService.getSelected(),
          keyManagementService.getTypes(),
        ]);

        if (!cancelled) {
          setItems(itemsData);
          setTypes(typesData);
        }
      } catch (err) {
        console.error("주요 관리사항 조회 실패:", err);
        if (!cancelled) {
          setError("데이터를 불러오는데 실패했습니다");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const getTypeDescription = (code: string) =>
    types.find((t) => t.code === code)?.description ?? code;

  return {
    items,
    types,
    isLoading,
    error,
    getTypeDescription,
  };
}
