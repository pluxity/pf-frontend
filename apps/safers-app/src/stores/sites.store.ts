import { create } from "zustand";

// ============================================================
// Types
// ============================================================

interface SitesState {
  /** 현재 선택된 사이트 ID */
  selectedSiteId: string | null;
  /** 호버 중인 사이트 ID */
  hoveredSiteId: string | null;
}

interface SitesActions {
  /** 사이트 선택 */
  selectSite: (siteId: string | null) => void;
  /** 사이트 호버 */
  hoverSite: (siteId: string | null) => void;
  /** 선택 초기화 */
  clearSelection: () => void;
}

type SitesStore = SitesState & SitesActions;

// ============================================================
// Store
// ============================================================

export const useSitesStore = create<SitesStore>()((set) => ({
  // State
  selectedSiteId: null,
  hoveredSiteId: null,

  // Actions
  selectSite: (siteId) => set({ selectedSiteId: siteId }),
  hoverSite: (siteId) => set({ hoveredSiteId: siteId }),
  clearSelection: () => set({ selectedSiteId: null, hoveredSiteId: null }),
}));

// ============================================================
// Selectors (리렌더링 최적화)
// ============================================================

export const selectSelectedSiteId = (state: SitesStore) => state.selectedSiteId;
export const selectHoveredSiteId = (state: SitesStore) => state.hoveredSiteId;
export const selectSite = (state: SitesStore) => state.selectSite;
export const selectHoverSite = (state: SitesStore) => state.hoverSite;
