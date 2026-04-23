import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 767px)";
const LANDSCAPE_QUERY = "(orientation: landscape) and (max-height: 500px)";

function createMediaHook(query: string) {
  function subscribe(callback: () => void) {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  }

  function getSnapshot() {
    return window.matchMedia(query).matches;
  }

  function getServerSnapshot() {
    return false;
  }

  return { subscribe, getSnapshot, getServerSnapshot };
}

const mobile = createMediaHook(MOBILE_QUERY);
const landscape = createMediaHook(LANDSCAPE_QUERY);

/** JS 로직 분기용 모바일 감지 훅 (< 768px) */
export function useIsMobile(): boolean {
  return useSyncExternalStore(mobile.subscribe, mobile.getSnapshot, mobile.getServerSnapshot);
}

/** 모바일 가로 모드 감지 (landscape + max-height 500px) */
export function useIsLandscape(): boolean {
  return useSyncExternalStore(
    landscape.subscribe,
    landscape.getSnapshot,
    landscape.getServerSnapshot
  );
}
