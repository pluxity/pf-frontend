import { create } from "zustand";

interface SitesState {
  selectedSiteId: string | null;
  hoveredSiteId: string | null;
}

interface SitesActions {
  selectSite: (siteId: string | null) => void;
  hoverSite: (siteId: string | null) => void;
  clearSelection: () => void;
}

type SitesStore = SitesState & SitesActions;

/** 사이트 선택/호버 상태를 관리하는 스토어 */
export const useSitesStore = create<SitesStore>()((set) => ({
  selectedSiteId: null,
  hoveredSiteId: null,
  selectSite: (siteId) => set({ selectedSiteId: siteId }),
  hoverSite: (siteId) => set({ hoveredSiteId: siteId }),
  clearSelection: () => set({ selectedSiteId: null, hoveredSiteId: null }),
}));

export const selectSelectedSiteId = (state: SitesStore) => state.selectedSiteId;
export const selectHoveredSiteId = (state: SitesStore) => state.hoveredSiteId;
export const selectSelectSiteAction = (state: SitesStore) => state.selectSite;
export const selectHoverSiteAction = (state: SitesStore) => state.hoverSite;

export type { SitesState, SitesActions, SitesStore };
