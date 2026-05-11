import type { DangerZone } from "@/services/types/danger-zone.types";

export const MOCK_DANGER_ZONES: DangerZone[] = [
  {
    id: "dz-1",
    name: "위험구역",
    coordinates: [
      [126.846895, 37.500207],
      [126.846771, 37.500168],
      [126.846758, 37.5002],
      [126.846879, 37.500237],
    ],
  },
  {
    id: "dz-2",
    name: "위험구역 2",
    coordinates: [
      [126.846648, 37.500009],
      [126.846562, 37.500078],
      [126.84647, 37.500013],
      [126.846545, 37.499937],
    ],
  },
];
