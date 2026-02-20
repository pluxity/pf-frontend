import { create } from "zustand";

interface KeyManagementState {
  activeIndex: number;
  shouldShowView: boolean;
  setActiveIndex: (index: number) => void;
  resetShowView: () => void;
}

/**
 * 주요 관리사항 상태 스토어
 * Widget <-> View 간 activeIndex 동기화 + 탭 자동 이동
 */
export const useKeyManagementStore = create<KeyManagementState>((set) => ({
  activeIndex: 0,
  shouldShowView: false,
  setActiveIndex: (index) => set({ activeIndex: index, shouldShowView: true }),
  resetShowView: () => set({ shouldShowView: false }),
}));
