import { useInteractionStore } from "../store/interactionStore";

export interface MeshInfoProps {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showWhenHovered?: boolean;
}

/**
 * MeshInfo - Displays information about the hovered mesh
 *
 * This is a UI overlay component that shows mesh details
 */
export function MeshInfo({
  className = "",
  position = "top-right",
  showWhenHovered = true,
}: MeshInfoProps) {
  const hoveredMesh = useInteractionStore((s) => s.hoveredMesh);
  const getMeshInfo = useInteractionStore((s) => s.getHoveredMeshInfo);

  const meshInfo = getMeshInfo();

  if (showWhenHovered && !hoveredMesh) return null;
  if (!meshInfo) return null;

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-3 pointer-events-none z-10 ${className}`}
    >
      <div className="text-sm space-y-1.5 text-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">Name:</span>
          <span className="font-semibold">{meshInfo.name}</span>
        </div>
        {meshInfo.materialName && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">Material:</span>
            <span className="text-gray-700">{meshInfo.materialName}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * MeshInfoCompact - Compact version that shows minimal info
 */
export function MeshInfoCompact({
  className = "",
  position = "bottom-left",
}: Omit<MeshInfoProps, "showWhenHovered">) {
  const hoveredMesh = useInteractionStore((s) => s.hoveredMesh);
  const getMeshInfo = useInteractionStore((s) => s.getHoveredMeshInfo);

  const meshInfo = getMeshInfo();

  if (!hoveredMesh || !meshInfo) return null;

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} bg-black/70 backdrop-blur-sm rounded px-3 py-2 pointer-events-none z-10 ${className}`}
    >
      <p className="text-white text-sm font-medium">{meshInfo.name}</p>
      <p className="text-gray-300 text-xs">{meshInfo.triangles.toLocaleString()} triangles</p>
    </div>
  );
}
