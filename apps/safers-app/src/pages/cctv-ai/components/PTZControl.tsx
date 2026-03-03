import { useEffect, useRef, useState } from "react";
import { PTZJoystick } from "./PTZJoystick";

/** FAB + Popover 방식의 종합 카메라 제어 패널 */
export function PTZControl() {
  const [open, setOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(50);
  const [speed, setSpeed] = useState(3);
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        fabRef.current &&
        !fabRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative">
      {/* Popover 패널 */}
      {open && (
        <div
          ref={panelRef}
          className="absolute bottom-14 right-0 w-[280px] rounded-xl bg-[#1A1D27]/90 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.5)]"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* 헤더 */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 text-xs font-semibold text-white/70">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a7.723 7.723 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            카메라 제어
          </div>

          {/* 섹션 1: PTZ 조이스틱 + Zoom */}
          <div className="flex items-center justify-between gap-3 border-t border-white/5 px-4 py-4">
            {/* 좌측: 조이스틱 */}
            <PTZJoystick size={88} />

            {/* 우측: Zoom 컨트롤 */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-medium text-white/40">ZOOM</span>

              {/* Zoom In 버튼 */}
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-[#252833] text-white/70 transition-colors hover:bg-[#2A2D3A] hover:text-white active:bg-brand/30"
                onClick={() => setZoomLevel((v) => Math.min(100, v + 5))}
                title="Zoom In"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" d="M12 6v12M6 12h12" />
                </svg>
              </button>

              {/* 세로 슬라이더 */}
              <div className="relative flex h-[80px] w-5 items-end justify-center rounded-full bg-[#252833]">
                <div
                  className="w-full rounded-full bg-brand/40 transition-all"
                  style={{ height: `${zoomLevel}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={zoomLevel}
                  onChange={(e) => setZoomLevel(Number(e.target.value))}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  style={{ writingMode: "vertical-lr", direction: "rtl" }}
                  title={`Zoom ${zoomLevel}%`}
                />
              </div>

              {/* Zoom Out 버튼 */}
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-[#252833] text-white/70 transition-colors hover:bg-[#2A2D3A] hover:text-white active:bg-brand/30"
                onClick={() => setZoomLevel((v) => Math.max(0, v - 5))}
                title="Zoom Out"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" d="M6 12h12" />
                </svg>
              </button>
            </div>
          </div>

          {/* 섹션 2: PTZ 속도 */}
          <div className="border-t border-white/5 px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-medium text-white/40">속도</span>
              <span className="text-[10px] font-medium text-brand">{speed}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-white/30">느림</span>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[#252833] accent-brand [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand"
              />
              <span className="text-[9px] text-white/30">빠름</span>
            </div>
          </div>

          {/* 섹션 3: 프리셋 */}
          <div className="border-t border-white/5 px-4 py-3">
            <span className="mb-2 block text-[10px] font-medium text-white/40">프리셋</span>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                    activePreset === num
                      ? "bg-brand text-white shadow-[0_0_8px_rgba(77,126,255,0.4)]"
                      : "bg-[#252833] text-white/70 hover:bg-[#2A2D3A] hover:text-white"
                  }`}
                  onClick={() => setActivePreset((prev) => (prev === num ? null : num))}
                >
                  {num}
                </button>
              ))}

              {/* 홈 버튼 */}
              <button
                type="button"
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  activePreset === 0
                    ? "bg-brand text-white shadow-[0_0_8px_rgba(77,126,255,0.4)]"
                    : "bg-[#252833] text-white/70 hover:bg-[#2A2D3A] hover:text-white"
                }`}
                onClick={() => setActivePreset((prev) => (prev === 0 ? null : 0))}
                title="홈 포지션"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB 버튼 — 톱니바퀴 */}
      <button
        ref={fabRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
          open
            ? "bg-brand text-white shadow-[0_0_12px_rgba(77,126,255,0.5)]"
            : "bg-[#1A1D27]/80 text-white/60 backdrop-blur-sm hover:bg-[#252833] hover:text-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
        }`}
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        title="카메라 제어"
      >
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.431.992a7.723 7.723 0 010 .255c-.007.378.138.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}
