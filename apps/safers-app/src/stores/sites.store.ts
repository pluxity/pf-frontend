import { create } from "zustand";

export type StatusFilter = "normal" | "warning" | "danger" | null;

interface SitesState {
  selectedSiteId: number | null;
  hoveredSiteId: number | null;
  statusFilter: StatusFilter;
}

interface SitesActions {
  selectSite: (siteId: number | null) => void;
  hoverSite: (siteId: number | null) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  clearSelection: () => void;
}

type SitesStore = SitesState & SitesActions;

/** 사이트 선택/호버 상태를 관리하는 스토어 */
export const useSitesStore = create<SitesStore>()((set, get) => ({
  selectedSiteId: 18,
  hoveredSiteId: null,
  statusFilter: null,
  selectSite: (siteId) => set({ selectedSiteId: siteId }),
  hoverSite: (siteId) => set({ hoveredSiteId: siteId }),
  setStatusFilter: (filter) => set({ statusFilter: get().statusFilter === filter ? null : filter }),
  clearSelection: () => set({ selectedSiteId: null, hoveredSiteId: null }),
}));

export const selectSelectedSiteId = (state: SitesStore) => state.selectedSiteId;
export const selectHoveredSiteId = (state: SitesStore) => state.hoveredSiteId;
export const selectStatusFilter = (state: SitesStore) => state.statusFilter;
export const selectSelectSiteAction = (state: SitesStore) => state.selectSite;
export const selectHoverSiteAction = (state: SitesStore) => state.hoverSite;

export type { SitesState, SitesActions, SitesStore };
