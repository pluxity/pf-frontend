import { useCallback, useEffect, useRef, useState } from "react";

export type PTZDirection = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

interface StickPosition {
  x: number;
  y: number;
}

export interface PTZJoystickState {
  position: StickPosition;
  direction: PTZDirection | null;
  distance: number;
  isDragging: boolean;
}

interface PTZControlOptions {
  onDirectionChange?: (direction: PTZDirection | null, distance: number) => void;
  /** 키보드 방향키 연동 활성화 (기본: true) */
  enableKeyboard?: boolean;
}

function getDirection(x: number, y: number): PTZDirection | null {
  const dist = Math.sqrt(x * x + y * y);
  if (dist < 0.15) return null;

  const angle = Math.atan2(-y, x) * (180 / Math.PI);
  if (angle >= -22.5 && angle < 22.5) return "E";
  if (angle >= 22.5 && angle < 67.5) return "NE";
  if (angle >= 67.5 && angle < 112.5) return "N";
  if (angle >= 112.5 && angle < 157.5) return "NW";
  if (angle >= 157.5 || angle < -157.5) return "W";
  if (angle >= -157.5 && angle < -112.5) return "SW";
  if (angle >= -112.5 && angle < -67.5) return "S";
  if (angle >= -67.5 && angle < -22.5) return "SE";
  return null;
}

// 키보드 방향 → 정규화된 벡터
const KEY_VECTORS: Record<string, { x: number; y: number }> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

function resolveKeysToVector(keys: Set<string>): { x: number; y: number } | null {
  let x = 0;
  let y = 0;
  let count = 0;
  for (const key of keys) {
    const v = KEY_VECTORS[key];
    if (v) {
      x += v.x;
      y += v.y;
      count++;
    }
  }
  if (count === 0) return null;
  const len = Math.sqrt(x * x + y * y);
  if (len === 0) return null;
  return { x: x / len, y: y / len };
}

export function usePTZControl(options?: PTZControlOptions) {
  const [state, setState] = useState<PTZJoystickState>({
    position: { x: 0, y: 0 },
    direction: null,
    distance: 0,
    isDragging: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });
  const pressedKeysRef = useRef<Set<string>>(new Set());

  // ─── 포인터 드래그 ───

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setState((s) => ({ ...s, isDragging: true }));
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    setState((prev) => {
      if (!prev.isDragging || !containerRef.current) return prev;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const radius = rect.width / 2;

      let dx = e.clientX - centerX;
      let dy = e.clientY - centerY;

      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = radius * 0.85;
      if (dist > maxDist) {
        dx = (dx / dist) * maxDist;
        dy = (dy / dist) * maxDist;
      }

      const nx = dx / maxDist;
      const ny = dy / maxDist;
      const normalizedDist = Math.min(dist / maxDist, 1);
      const direction = getDirection(nx, ny);

      optionsRef.current?.onDirectionChange?.(direction, normalizedDist);

      return { position: { x: dx, y: dy }, direction, distance: normalizedDist, isDragging: true };
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    setState({
      position: { x: 0, y: 0 },
      direction: null,
      distance: 0,
      isDragging: false,
    });
    optionsRef.current?.onDirectionChange?.(null, 0);
  }, []);

  // ─── 키보드 방향키 ───

  const applyKeyboard = useCallback(() => {
    const vec = resolveKeysToVector(pressedKeysRef.current);
    if (!vec) {
      setState((prev) =>
        prev.direction === null && prev.position.x === 0 && prev.position.y === 0
          ? prev
          : { position: { x: 0, y: 0 }, direction: null, distance: 0, isDragging: false }
      );
      optionsRef.current?.onDirectionChange?.(null, 0);
      return;
    }

    const container = containerRef.current;
    const radius = container ? container.getBoundingClientRect().width / 2 : 50;
    const travel = radius * 0.6;
    const direction = getDirection(vec.x, vec.y);

    setState({
      position: { x: vec.x * travel, y: vec.y * travel },
      direction,
      distance: 0.7,
      isDragging: false,
    });
    optionsRef.current?.onDirectionChange?.(direction, 0.7);
  }, []);

  useEffect(() => {
    if (options?.enableKeyboard === false) return;
    const keys = pressedKeysRef.current;

    function onKeyDown(e: KeyboardEvent) {
      if (!KEY_VECTORS[e.key]) return;
      e.preventDefault();
      keys.add(e.key);
      applyKeyboard();
    }

    function onKeyUp(e: KeyboardEvent) {
      if (!KEY_VECTORS[e.key]) return;
      keys.delete(e.key);
      applyKeyboard();
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      keys.clear();
    };
  }, [applyKeyboard, options?.enableKeyboard]);

  return {
    state,
    containerRef,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}
