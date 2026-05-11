import { useState } from "react";

export interface PickedPoint {
  id: string;
  lng: number;
  lat: number;
  altitude: number;
  /** raycast로 mesh에 맞은 점인지 (vs 지표면 fallback) */
  hitMesh: boolean;
}

interface CoordinatePickerPanelProps {
  points: PickedPoint[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

function formatPoint(p: PickedPoint): string {
  return `{ lng: ${p.lng.toFixed(6)}, lat: ${p.lat.toFixed(6)}, altitude: ${p.altitude.toFixed(2)} }`;
}

function formatAsTuple(p: PickedPoint): string {
  return `[${p.lng.toFixed(6)}, ${p.lat.toFixed(6)}]`;
}

function formatAllAsArray(points: PickedPoint[]): string {
  if (points.length === 0) return "[]";
  return `[\n${points.map((p) => `  ${formatPoint(p)},`).join("\n")}\n]`;
}

function formatAllAsTupleArray(points: PickedPoint[]): string {
  if (points.length === 0) return "[]";
  return `[\n${points.map((p) => `  ${formatAsTuple(p)},`).join("\n")}\n]`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CoordinatePickerPanel({
  points,
  onRemove,
  onClear,
  onClose,
}: CoordinatePickerPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<"obj" | "tuple" | null>(null);

  async function handleCopyOne(p: PickedPoint) {
    const ok = await copyToClipboard(formatPoint(p));
    if (ok) {
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 1200);
    }
  }

  async function handleCopyAllObjects() {
    const ok = await copyToClipboard(formatAllAsArray(points));
    if (ok) {
      setCopiedAll("obj");
      setTimeout(() => setCopiedAll(null), 1200);
    }
  }

  async function handleCopyAllTuples() {
    const ok = await copyToClipboard(formatAllAsTupleArray(points));
    if (ok) {
      setCopiedAll("tuple");
      setTimeout(() => setCopiedAll(null), 1200);
    }
  }

  return (
    <div className="pointer-events-auto absolute left-1/2 top-[7.5rem] z-[55] w-[20rem] -translate-x-1/2 rounded-lg border border-[#2A2D3A] bg-[#0F1117]/95 text-white shadow-xl backdrop-blur-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-[#2A2D3A] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">좌표 캡처</span>
          <span className="rounded bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold text-brand">
            {points.length}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="닫기"
          className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 안내 */}
      <div className="border-b border-[#2A2D3A] px-3 py-1.5 text-[11px] text-white/40">
        <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px] text-white/70">
          Ctrl
        </kbd>
        {" / "}
        <kbd className="rounded bg-white/10 px-1 py-0.5 font-mono text-[10px] text-white/70">⌘</kbd>
        {" + 클릭으로 좌표 추가"}
      </div>

      {/* 좌표 목록 */}
      <div className="max-h-[20rem] overflow-y-auto">
        {points.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-white/30">
            아직 캡처된 좌표가 없습니다
          </div>
        ) : (
          <ul>
            {points.map((p, i) => (
              <li
                key={p.id}
                className="flex items-start gap-2 border-b border-[#2A2D3A] px-3 py-2 last:border-b-0"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/20 text-[10px] font-bold text-brand">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[11px] leading-snug text-white/80 break-all">
                    {p.lng.toFixed(6)}, {p.lat.toFixed(6)}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/40">
                    <span className="font-mono">alt {p.altitude.toFixed(2)}m</span>
                    {!p.hitMesh && (
                      <span
                        title="지표면 추정 — 모델에 직접 hit한 좌표가 아닙니다"
                        className="rounded bg-yellow-500/15 px-1 py-0.5 text-yellow-300/80"
                      >
                        지면
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    onClick={() => handleCopyOne(p)}
                    className="rounded border border-[#2A2D3A] bg-[#1A1D27] px-1.5 py-0.5 text-[10px] text-white/60 transition-colors hover:bg-[#252833] hover:text-white"
                  >
                    {copiedId === p.id ? "복사됨" : "복사"}
                  </button>
                  <button
                    onClick={() => onRemove(p.id)}
                    aria-label="삭제"
                    className="rounded border border-transparent px-1.5 py-0.5 text-[10px] text-white/30 transition-colors hover:border-error-brand/30 hover:bg-error-brand/10 hover:text-error-brand"
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 푸터 액션 */}
      <div className="flex items-center gap-1.5 border-t border-[#2A2D3A] px-3 py-2">
        <button
          disabled={points.length === 0}
          onClick={handleCopyAllObjects}
          className="flex-1 rounded border border-brand/40 bg-brand/10 px-2 py-1.5 text-[11px] font-semibold text-brand transition-colors hover:bg-brand/20 disabled:cursor-not-allowed disabled:border-[#2A2D3A] disabled:bg-[#1A1D27] disabled:text-white/20"
        >
          {copiedAll === "obj" ? "복사됨" : "객체 배열"}
        </button>
        <button
          disabled={points.length === 0}
          onClick={handleCopyAllTuples}
          className="flex-1 rounded border border-[#2A2D3A] bg-[#1A1D27] px-2 py-1.5 text-[11px] font-semibold text-white/70 transition-colors hover:bg-[#252833] hover:text-white disabled:cursor-not-allowed disabled:text-white/20"
        >
          {copiedAll === "tuple" ? "복사됨" : "[lng,lat] 배열"}
        </button>
        <button
          disabled={points.length === 0}
          onClick={onClear}
          className="rounded border border-transparent px-2 py-1.5 text-[11px] text-white/40 transition-colors hover:border-error-brand/30 hover:bg-error-brand/10 hover:text-error-brand disabled:cursor-not-allowed disabled:text-white/20"
        >
          전체 삭제
        </button>
      </div>
    </div>
  );
}
