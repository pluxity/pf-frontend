import type { GISCoordinate } from "../types";

interface CoordinateDisplayProps {
  coordinate: GISCoordinate | null;
  pointCount?: number;
}

export function CoordinateDisplay({ coordinate, pointCount }: CoordinateDisplayProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "16px",
        left: "16px",
        padding: "12px 16px",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "white",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: "13px",
        zIndex: 5,
      }}
    >
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
        <div
          style={{
            marginTop: "8px",
            borderTop: "1px solid rgba(255,255,255,0.3)",
            paddingTop: "8px",
          }}
        >
          Points: {pointCount.toLocaleString()}
        </div>
      )}
    </div>
  );
}
