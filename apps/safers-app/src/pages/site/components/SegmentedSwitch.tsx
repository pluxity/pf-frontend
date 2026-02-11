import { useRef } from "react";

interface SegmentedSwitchOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  ariaLabel?: string;
}

interface SegmentedSwitchProps<T extends string = string> {
  options: SegmentedSwitchOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}

export function SegmentedSwitch<T extends string = string>({
  options,
  value,
  onValueChange,
  className = "",
}: SegmentedSwitchProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null);
  const activeIndex = options.findIndex((o) => o.value === value);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();

    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (activeIndex + dir + options.length) % options.length;
    onValueChange(options[next]!.value);

    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons?.[next]?.focus();
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      className={`relative flex h-8 items-center rounded-full bg-[#E8E8E8] p-[3px] ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* sliding indicator */}
      <div
        className="absolute top-[3px] bottom-[3px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out"
        style={{
          width: `calc(${100 / options.length}% - 3px)`,
          left: "1.5px",
          transform: `translateX(calc(${activeIndex} * (100% + ${3 / (options.length - 0.5)}px)))`,
        }}
      />

      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.ariaLabel}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            className={`relative z-10 flex-1 px-3 py-1 text-xs font-medium transition-colors duration-150 ${
              isActive ? "text-[#333]" : "text-[#999]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
