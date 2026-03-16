import { useEffect, useRef, useState } from "react";
import { JoystickIcon } from "@/assets/icons/JoystickIcon";
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
            <JoystickIcon size={14} />
            카메라 제어
          </div>

          {/* 섹션 1: PTZ 조이스틱 + Zoom */}
          <div className="flex items-center gap-3 border-t border-white/5 px-4 py-4">
            {/* 조이스틱 — 가운데 정렬 */}
            <div className="flex flex-1 justify-center">
              <PTZJoystick size={88} />
            </div>

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

      {/* FAB 버튼 — 조이스틱 */}
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
        <JoystickIcon size={20} />
      </button>
    </div>
  );
}
