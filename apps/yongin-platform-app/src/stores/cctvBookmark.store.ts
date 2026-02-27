import { create } from "zustand";
import { cctvBookmarkService } from "@/services/cctv-bookmark.service";
import type { CctvBookmark } from "@/services/types/cctv-bookmark";

const MAX_BOOKMARKS = 4;

interface CctvBookmarkState {
  bookmarks: CctvBookmark[];
  isLoading: boolean;
  error: string | null;
  _initialized: boolean;
}

interface CctvBookmarkActions {
  fetch: () => Promise<void>;
  ensureLoaded: () => Promise<void>;
  add: (streamName: string) => Promise<boolean>;
  remove: (streamName: string) => Promise<void>;
  isBookmarked: (streamName: string) => boolean;
  getBookmarkByStreamName: (streamName: string) => CctvBookmark | undefined;
  clearError: () => void;
}

type CctvBookmarkStore = CctvBookmarkState & CctvBookmarkActions;

export const useCctvBookmarkStore = create<CctvBookmarkStore>()((set, get) => ({
  bookmarks: [],
  isLoading: true,
  error: null,
  _initialized: false,

  fetch: async () => {
    try {
      set({ isLoading: true, error: null });
      const bookmarks = await cctvBookmarkService.getAll();
      set({ bookmarks, isLoading: false, _initialized: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "즐겨찾기를 불러오지 못했습니다";
      set({ isLoading: false, error: message, _initialized: true });
    }
  },

  ensureLoaded: async () => {
    if (get()._initialized) return;
    await get().fetch();
  },

  add: async (streamName: string) => {
    const { bookmarks } = get();
    if (bookmarks.length >= MAX_BOOKMARKS) {
      return false;
    }

    try {
      set({ error: null });
      await cctvBookmarkService.create(streamName);
      await get().fetch();
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : "즐겨찾기 추가에 실패했습니다";
      set({ error: message });
      return false;
    }
  },

  remove: async (streamName: string) => {
    const bookmark = get().getBookmarkByStreamName(streamName);
    if (!bookmark) return;

    try {
      set({ error: null });
      await cctvBookmarkService.delete(bookmark.id);
      await get().fetch();
    } catch (e) {
      const message = e instanceof Error ? e.message : "즐겨찾기 삭제에 실패했습니다";
      set({ error: message });
    }
  },

  isBookmarked: (streamName: string) => {
    return get().bookmarks.some((b) => b.streamName === streamName);
  },

  getBookmarkByStreamName: (streamName: string) => {
    return get().bookmarks.find((b) => b.streamName === streamName);
  },

  clearError: () => set({ error: null }),
}));

export const selectBookmarks = (state: CctvBookmarkStore) => state.bookmarks;
export const selectIsLoading = (state: CctvBookmarkStore) => state.isLoading;
export const selectError = (state: CctvBookmarkStore) => state.error;
