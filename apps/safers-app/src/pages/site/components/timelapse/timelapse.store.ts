import { create } from "zustand";
import type {
  ConstructionPhase,
  ConstructionSchedule,
  PlaybackSpeed,
  StructureNode,
} from "./types";
import { fetchSchedule } from "./schedule-data";

interface TimelapseState {
  schedule: ConstructionSchedule | null;
  isLoading: boolean;
  currentDate: Date;
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
}

interface TimelapseActions {
  loadSchedule: (siteId?: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  setDate: (date: Date) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  reset: () => void;
}

type TimelapseStore = TimelapseState & TimelapseActions;

export const useTimelapseStore = create<TimelapseStore>()((set) => ({
  schedule: null,
  isLoading: false,
  currentDate: new Date(),
  isPlaying: false,
  playbackSpeed: 1 as PlaybackSpeed,

  loadSchedule: async (siteId?: string) => {
    set({ isLoading: true });
    try {
      const schedule = await fetchSchedule(siteId);
      set({
        schedule,
        currentDate: new Date(schedule.project.startDate),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  setDate: (date: Date) => set({ currentDate: date }),
  setSpeed: (speed: PlaybackSpeed) => set({ playbackSpeed: speed }),
  reset: () =>
    set((state) => ({
      currentDate: state.schedule ? new Date(state.schedule.project.startDate) : new Date(),
      isPlaying: false,
      playbackSpeed: 1,
    })),
}));

function flattenLeafPaths(nodes: StructureNode[], prefix = ""): string[] {
  const paths: string[] = [];
  function walk(node: StructureNode, parentPath: string) {
    const currentPath = parentPath ? `${parentPath}/${node.id}` : node.id;
    if (!node.children || node.children.length === 0) {
      paths.push(currentPath);
    } else {
      node.children.forEach((child) => walk(child, currentPath));
    }
  }
  nodes.forEach((node) => walk(node, prefix));
  return paths;
}

export function resolveCurrentPhases(
  schedule: ConstructionSchedule,
  currentDate: Date
): Map<string, ConstructionPhase> {
  const phases = new Map<string, ConstructionPhase>();

  for (const period of schedule.periods) {
    if (new Date(period.startDate) > currentDate) break;
    for (const task of period.tasks) {
      phases.set(task.structureId, task.phase);
    }
  }

  return phases;
}

export function getLeafPaths(schedule: ConstructionSchedule): string[] {
  return flattenLeafPaths(schedule.structures);
}
