import { useEffect, useState, useCallback } from "react";
import type { Map as MapboxMap } from "mapbox-gl";

interface CameraInfo {
  lng: number;
  lat: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

interface CameraDebugPanelProps {
  mapRef: React.RefObject<MapboxMap | null>;
}

export function CameraDebugPanel({ mapRef }: CameraDebugPanelProps) {
  const [camera, setCamera] = useState<CameraInfo | null>(null);
  const [copied, setCopied] = useState(false);

  const updateCamera = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter();
    setCamera({
      lng: Math.round(center.lng * 1e6) / 1e6,
      lat: Math.round(center.lat * 1e6) / 1e6,
      zoom: Math.round(map.getZoom() * 100) / 100,
      pitch: Math.round(map.getPitch() * 100) / 100,
      bearing: Math.round(map.getBearing() * 100) / 100,
    });
  }, [mapRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    updateCamera();
    map.on("move", updateCamera);
    return () => {
      map.off("move", updateCamera);
    };
  }, [mapRef, updateCamera]);

  const handleCopy = useCallback(() => {
    if (!camera) return;
    const json = JSON.stringify(
      {
        center: [camera.lng, camera.lat] as [number, number],
        zoom: camera.zoom,
        pitch: camera.pitch,
        bearing: camera.bearing,
      },
      null,
      2
    );
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [camera]);

  if (!camera) return null;

  return (
    <div className="pointer-events-auto absolute bottom-2 right-2 z-[10] rounded-lg bg-black/80 px-3 py-2 font-mono text-[11px] text-white shadow-lg backdrop-blur-sm">
      <div className="mb-1.5 flex items-center justify-between gap-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Camera</span>
        <button
          onClick={handleCopy}
          className="rounded bg-white/10 px-2 py-0.5 text-[10px] transition-colors hover:bg-white/20"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <table className="w-full">
        <tbody>
          <Row label="center" value={`${camera.lng}, ${camera.lat}`} />
          <Row label="zoom" value={camera.zoom} />
          <Row label="pitch" value={camera.pitch} />
          <Row label="bearing" value={camera.bearing} />
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <tr>
      <td className="pr-3 text-white/50">{label}</td>
      <td className="text-right tabular-nums text-[#00C48C]">{value}</td>
    </tr>
  );
}
