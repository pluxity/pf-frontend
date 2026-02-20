import { useEffect, useRef } from "react";

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AreaSelectionOverlayProps {
  active: boolean;
  onSelectionComplete: (rect: SelectionRect) => void;
  onCancel: () => void;
}

export function AreaSelectionOverlay({
  active,
  onSelectionComplete,
  onCancel,
}: AreaSelectionOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        startRef.current = null;
        if (rectRef.current) rectRef.current.style.display = "none";
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, onCancel]);

  if (!active) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.setPointerCapture(e.pointerId);

    const bounds = overlay.getBoundingClientRect();
    startRef.current = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };

    if (rectRef.current) {
      rectRef.current.style.left = `${startRef.current.x}px`;
      rectRef.current.style.top = `${startRef.current.y}px`;
      rectRef.current.style.width = "0px";
      rectRef.current.style.height = "0px";
      rectRef.current.style.display = "block";
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const start = startRef.current;
    const rect = rectRef.current;
    const overlay = overlayRef.current;
    if (!start || !rect || !overlay) return;

    const bounds = overlay.getBoundingClientRect();
    const cx = e.clientX - bounds.left;
    const cy = e.clientY - bounds.top;

    const x = Math.min(start.x, cx);
    const y = Math.min(start.y, cy);
    const w = Math.abs(cx - start.x);
    const h = Math.abs(cy - start.y);

    rect.style.left = `${x}px`;
    rect.style.top = `${y}px`;
    rect.style.width = `${w}px`;
    rect.style.height = `${h}px`;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const start = startRef.current;
    const overlay = overlayRef.current;
    if (!start || !overlay) return;

    overlay.releasePointerCapture(e.pointerId);

    const bounds = overlay.getBoundingClientRect();
    const cx = e.clientX - bounds.left;
    const cy = e.clientY - bounds.top;

    const x = Math.min(start.x, cx);
    const y = Math.min(start.y, cy);
    const w = Math.abs(cx - start.x);
    const h = Math.abs(cy - start.y);

    startRef.current = null;
    if (rectRef.current) rectRef.current.style.display = "none";

    // Ignore tiny drags (accidental clicks)
    if (w < 10 || h < 10) return;

    onSelectionComplete({ x, y, width: w, height: h });
  };

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-[5] cursor-crosshair"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        ref={rectRef}
        className="pointer-events-none absolute hidden border-2 border-dashed border-[#4D7EFF] bg-[#4D7EFF]/10"
      />
    </div>
  );
}
