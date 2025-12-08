import { useEffect, useRef, useState } from "react";
import { Viewer } from "cesium";
import { createViewer, setupImagery, flyTo } from "@pf-dev/map";
import { fromUrl } from "geotiff";

export default function KoreaDEMTerrain() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [status, setStatus] = useState("로딩 중...");
  const [demInfo, setDemInfo] = useState<{
    width: number;
    height: number;
    bbox: number[];
    min: number;
    max: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const initMap = async () => {
      try {
        setStatus("GeoTIFF 파일 로딩 중...");

        // GeoTIFF 파일 로드
        const tiff = await fromUrl("/korea.tif");
        const image = await tiff.getImage();

        const width = image.getWidth();
        const height = image.getHeight();
        const bbox = image.getBoundingBox();
        const data = await image.readRasters();

        // DEM 데이터 통계 (큰 배열이므로 반복문으로 처리)
        const elevationData = data[0] as Float32Array | Int16Array | Uint16Array;
        let min = Infinity;
        let max = -Infinity;

        for (let i = 0; i < elevationData.length; i++) {
          const value = elevationData[i];
          if (value < min) min = value;
          if (value > max) max = value;
        }

        setDemInfo({
          width,
          height,
          bbox,
          min,
          max,
        });

        setStatus("지도 초기화 중...");

        // Viewer 생성
        const viewer = createViewer(containerRef.current!, {
          timeline: false,
          animation: false,
        });

        viewerRef.current = viewer;

        // OSM Imagery 사용
        await setupImagery(viewer, {
          provider: "osm",
        });

        // 한국 중심으로 카메라 이동 (bbox 기반)
        const centerLon = (bbox[0] + bbox[2]) / 2;
        const centerLat = (bbox[1] + bbox[3]) / 2;

        setStatus(`DEM 로드 완료! (${width}x${height})`);

        flyTo(viewer, {
          destination: {
            longitude: centerLon,
            latitude: centerLat,
            height: 500000,
            heading: 0,
            pitch: -45,
            roll: 0,
          },
          duration: 2,
        });

        // TODO: Custom Terrain Provider 구현 필요
        // 현재는 DEM 정보만 표시
        console.log("DEM Info:", {
          dimensions: `${width}x${height}`,
          bbox,
          elevation: `${min.toFixed(1)}m ~ ${max.toFixed(1)}m`,
        });
      } catch (error) {
        console.error("DEM 로딩 실패:", error);
        setStatus(`에러: ${error instanceof Error ? error.message : "알 수 없는 에러"}`);
      }
    };

    initMap();

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* DEM 정보 오버레이 */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "12px 16px",
          borderRadius: 8,
          fontSize: 13,
          fontFamily: "monospace",
          maxWidth: 400,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>Korea DEM Status</div>
        <div>{status}</div>
        {demInfo && (
          <div style={{ marginTop: 8, fontSize: 11, color: "#aaa" }}>
            <div>
              크기: {demInfo.width.toLocaleString()} x {demInfo.height.toLocaleString()}
            </div>
            <div>
              범위: [{demInfo.bbox[0].toFixed(2)}, {demInfo.bbox[1].toFixed(2)}] ~ [
              {demInfo.bbox[2].toFixed(2)}, {demInfo.bbox[3].toFixed(2)}]
            </div>
            <div>
              고도: {demInfo.min.toFixed(1)}m ~ {demInfo.max.toFixed(1)}m
            </div>
            <div style={{ marginTop: 8, color: "#ff9500" }}>⚠️ Terrain 렌더링은 추가 구현 필요</div>
          </div>
        )}
      </div>
    </div>
  );
}
