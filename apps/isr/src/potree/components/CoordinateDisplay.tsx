import type { GISCoordinate } from "../types";

interface CoordinateDisplayProps {
  coordinate: GISCoordinate | null;
  pointCount?: number;
}

export function CoordinateDisplay({ coordinate, pointCount }: CoordinateDisplayProps) {
  return (
    <div className="absolute bottom-4 left-4 px-4 py-3 bg-black/70 text-white rounded-lg font-mono text-[13px] z-[5]">
      {coordinate ? (
        <div>
          <div>X: {coordinate.x.toFixed(3)}</div>
          <div>Y: {coordinate.y.toFixed(3)}</div>
          <div>Z: {coordinate.z.toFixed(3)}</div>
        </div>
      ) : (
        <div>Hover over point cloud</div>
      )}
      {pointCount !== undefined && (
        <div className="mt-2 border-t border-white/30 pt-2">
          Points: {pointCount.toLocaleString()}
        </div>
      )}
    </div>
  );
}
