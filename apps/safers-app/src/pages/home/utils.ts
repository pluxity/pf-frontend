import type { Event, Site } from "@/services";

/** 이벤트 목록에서 현장별 최고 위험 수준을 집계 */
export function buildSiteStatusMap(events: Event[]): Map<number, "warning" | "danger"> {
  const statusMap = new Map<number, "warning" | "danger">();
  for (const evt of events) {
    const current = statusMap.get(evt.site.id);
    if (evt.level === "danger") {
      statusMap.set(evt.site.id, "danger");
    } else if ((evt.level === "alert" || evt.level === "warning") && current !== "danger") {
      statusMap.set(evt.site.id, "warning");
    }
  }
  return statusMap;
}

/** 현장 목록과 상태 맵으로 정상/주의/위험 건수를 집계 */
export function countSiteStatuses(
  sites: Site[],
  statusMap: Map<number, "warning" | "danger">
): { normal: number; warning: number; danger: number } {
  const counts = { normal: 0, warning: 0, danger: 0 };
  for (const site of sites) {
    const status = statusMap.get(site.id);
    counts[status ?? "normal"]++;
  }
  return counts;
}
