import { useEffect } from "react";
import { useCctvBookmarkStore } from "@/stores/cctvBookmark.store";

export function useCCTVBookmarks() {
  const bookmarks = useCctvBookmarkStore((s) => s.bookmarks);
  const isLoading = useCctvBookmarkStore((s) => s.isLoading);
  const error = useCctvBookmarkStore((s) => s.error);
  const ensureLoaded = useCctvBookmarkStore((s) => s.ensureLoaded);

  useEffect(() => {
    ensureLoaded();
  }, [ensureLoaded]);

  return {
    bookmarks,
    isLoading,
    error,
  };
}
