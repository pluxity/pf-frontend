import { useState, useEffect } from "react";

interface ContainerSize {
  width: number;
  height: number;
}

/** 컨테이너 요소의 크기를 ResizeObserver로 추적하는 훅 */
export function useContainerSize(ref: React.RefObject<HTMLElement | null>): ContainerSize {
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []); // ref는 stable이므로 의존성 불필요

  return size;
}
