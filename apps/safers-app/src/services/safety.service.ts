import type { SafetyItem } from "./types/safety.types";
import { EVENT_TYPE_TO_SAFETY_KEY, createDefaultSafetyData } from "./types/safety.types";
import type { StompEventType } from "./types/events.types";
import { API_BASE_URL } from "./config";

interface EventApiSite {
  id: number;
  name: string;
}

interface EventApiItem {
  id: number;
  type: StompEventType;
  category: string;
  site: EventApiSite;
}

interface EventApiResponse {
  data: {
    content: EventApiItem[];
    totalElements: number;
  };
}

/**
 * 안전 모니터링 데이터 조회
 * Event API에서 오늘 이벤트를 전체 조회 후, siteId로 클라이언트 필터링
 */
async function getSafetyData(siteId?: number): Promise<SafetyItem[]> {
  const safetyData = createDefaultSafetyData();

  try {
    const params = new URLSearchParams();
    params.set("size", "9999");
    params.set("query", "오늘 발생한 이벤트");

    const response = await fetch(`${API_BASE_URL}/events?${params}`);
    if (!response.ok) return safetyData;

    const result: EventApiResponse = await response.json();
    let events = result.data?.content ?? [];

    // siteId가 있으면 해당 현장 이벤트만 필터링
    if (siteId) {
      events = events.filter((e) => e.site.id === siteId);
    }

    // 이벤트 타입별 카운트 누적
    for (const event of events) {
      const safetyKey = EVENT_TYPE_TO_SAFETY_KEY[event.type];
      if (!safetyKey) continue;

      const item = safetyData.find((s) => s.key === safetyKey);
      if (item) item.count += 1;
    }
  } catch {
    // API 실패 시 기본값 반환
  }

  return safetyData;
}

/**
 * STOMP 이벤트로 안전 모니터링 데이터 실시간 누적
 */
function accumulateEvent(current: SafetyItem[], eventType: StompEventType): SafetyItem[] {
  const safetyKey = EVENT_TYPE_TO_SAFETY_KEY[eventType];
  if (!safetyKey) return current;

  return current.map((item) =>
    item.key === safetyKey ? { ...item, count: item.count + 1 } : item
  );
}

export const safetyService = {
  getSafetyData,
  accumulateEvent,
};
