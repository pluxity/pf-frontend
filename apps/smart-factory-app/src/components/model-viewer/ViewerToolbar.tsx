import { useState } from "react";
import type { UnifiedSceneApi } from "@/babylon/types";

interface ViewerToolbarProps {
  sceneApi: UnifiedSceneApi | null;
}

export function ViewerToolbar({ sceneApi }: ViewerToolbarProps) {
  const [wireframe, setWireframe] = useState(false);
  const [sectionEnabled, setSectionEnabled] = useState(false);
  const [sectionAxis, setSectionAxis] = useState<"x" | "y" | "z">("y");
  const [sectionPosition, setSectionPosition] = useState(50);

  function handleFit() {
    sceneApi?.fitCamera();
  }

  function handleWireframe() {
    const next = !wireframe;
    setWireframe(next);
    sceneApi?.setWireframe(next);
  }

  function handleSectionToggle() {
    if (sectionEnabled) {
      sceneApi?.disableSection();
      setSectionEnabled(false);
    } else {
      sceneApi?.enableSection(sectionAxis, sectionPosition);
      setSectionEnabled(true);
    }
  }

  function handleSectionAxisChange(axis: "x" | "y" | "z") {
    setSectionAxis(axis);
    if (sectionEnabled) {
      sceneApi?.disableSection();
      sceneApi?.enableSection(axis, sectionPosition);
    }
  }

  function handleSectionPositionChange(value: number) {
    setSectionPosition(value);
    if (sectionEnabled) {
      sceneApi?.setSectionPosition(value);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Fit button */}
      <ToolbarButton title="Fit to view" active={false} onClick={handleFit}>
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
          />
        </svg>
      </ToolbarButton>

      {/* Wireframe button */}
      <ToolbarButton title="Toggle wireframe" active={wireframe} onClick={handleWireframe}>
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
          />
        </svg>
      </ToolbarButton>

      {/* Section view button */}
      <ToolbarButton
        title="Toggle section view"
        active={sectionEnabled}
        onClick={handleSectionToggle}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
          />
        </svg>
      </ToolbarButton>

      {/* Section controls (shown when section is enabled) */}
      {sectionEnabled && (
        <div className="ml-2 flex items-center gap-2 rounded bg-neutral-800 px-2 py-1">
          {/* Axis selector */}
          {(["x", "y", "z"] as const).map((axis) => (
            <button
              key={axis}
              className={`rounded px-1.5 py-0.5 text-xs font-medium uppercase ${
                sectionAxis === axis
                  ? "bg-brand text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
              onClick={() => handleSectionAxisChange(axis)}
            >
              {axis}
            </button>
          ))}

          {/* Position slider */}
          <input
            type="range"
            min={-100}
            max={100}
            value={sectionPosition}
            onChange={(e) => handleSectionPositionChange(Number(e.target.value))}
            className="h-1 w-24 cursor-pointer accent-brand"
          />
          <span className="w-8 text-right text-[10px] text-neutral-500">{sectionPosition}</span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function ToolbarButton({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`rounded p-1.5 transition-colors ${
        active
          ? "bg-brand/20 text-brand"
          : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
      }`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
