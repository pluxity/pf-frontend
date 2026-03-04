import { usePTZControl, type PTZDirection } from "@/hooks/usePTZControl";
import { STATUS_COLORS } from "@/styles/tokens";

const DIRECTIONS: { dir: PTZDirection; angle: number; rotation: number }[] = [
  { dir: "N", angle: 270, rotation: -90 },
  { dir: "NE", angle: 315, rotation: -45 },
  { dir: "E", angle: 0, rotation: 0 },
  { dir: "SE", angle: 45, rotation: 45 },
  { dir: "S", angle: 90, rotation: 90 },
  { dir: "SW", angle: 135, rotation: 135 },
  { dir: "W", angle: 180, rotation: 180 },
  { dir: "NW", angle: 225, rotation: -135 },
];

interface PTZJoystickProps {
  size?: number;
  onDirectionChange?: (direction: PTZDirection | null, distance: number) => void;
}

export function PTZJoystick({ size = 88, onDirectionChange }: PTZJoystickProps) {
  const { state, containerRef, handlers } = usePTZControl({ onDirectionChange });

  const stickSize = size * 0.32;
  const baseRadius = size / 2;
  // 화살표를 베이스 가장자리 바깥에 배치
  const arrowRadius = baseRadius + 10;
  const totalSize = size + 24; // 화살표 공간 포함
  const offset = (totalSize - size) / 2;

  return (
    <div
      className="relative select-none touch-none"
      style={{ width: totalSize, height: totalSize }}
    >
      {/* 8방향 화살표 — 베이스 바깥 */}
      {DIRECTIONS.map(({ dir, angle, rotation }) => {
        const rad = (angle * Math.PI) / 180;
        const ax = Math.cos(rad) * arrowRadius + totalSize / 2;
        const ay = Math.sin(rad) * arrowRadius + totalSize / 2;
        const isActive = state.direction === dir;

        return (
          <div
            key={dir}
            className="absolute pointer-events-none"
            style={{
              left: ax,
              top: ay,
              transform: "translate(-50%, -50%)",
            }}
          >
            <svg
              width={8}
              height={8}
              viewBox="0 0 10 10"
              fill="none"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: "opacity 0.15s, color 0.15s",
                opacity: isActive ? 1 : 0.35,
                color: isActive ? STATUS_COLORS.brand : "#ffffff",
              }}
            >
              <path
                d="M2 5h6M6 2.5L8.5 5 6 7.5"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      })}

      {/* 포인터 이벤트 영역 — 베이스 원형 */}
      <div
        ref={containerRef}
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          left: offset,
          top: offset,
          background:
            "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 60%, rgba(255,255,255,0.02) 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.3)",
        }}
        {...handlers}
      >
        {/* 스틱 */}
        <div
          className="absolute rounded-full"
          style={{
            width: stickSize,
            height: stickSize,
            left: size / 2 - stickSize / 2 + state.position.x,
            top: size / 2 - stickSize / 2 + state.position.y,
            background:
              state.isDragging || state.direction
                ? `radial-gradient(circle, #6DA0FF 0%, ${STATUS_COLORS.brand} 60%, #3A65D0 100%)`
                : "radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.25) 60%, rgba(255,255,255,0.12) 100%)",
            boxShadow:
              state.isDragging || state.direction
                ? "0 0 10px rgba(77,126,255,0.5), 0 1px 4px rgba(0,0,0,0.3)"
                : "0 1px 4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2)",
            transition: state.isDragging
              ? "background 0.1s, box-shadow 0.1s"
              : "left 0.2s ease-out, top 0.2s ease-out, background 0.15s, box-shadow 0.15s",
            cursor: state.isDragging ? "grabbing" : "grab",
          }}
        />
      </div>
    </div>
  );
}
