import type { ConstructionSchedule } from "./types";

export async function fetchSchedule(_siteId?: string): Promise<ConstructionSchedule> {
  const url = `/data/schedules/site-001.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load schedule: ${res.status}`);
  return res.json() as Promise<ConstructionSchedule>;
}
