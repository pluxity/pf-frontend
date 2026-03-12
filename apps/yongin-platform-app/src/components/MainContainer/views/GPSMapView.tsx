import "maplibre-gl/dist/maplibre-gl.css";
import { useState, useRef, useMemo } from "react";
import Map, { Popup, Marker } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import Supercluster from "supercluster";
import workerIcon from "../../../assets/icons/worker.svg";
import workerActiveIcon from "../../../assets/icons/worker-active.svg";
import { useWorkerLocations } from "@/hooks";
import polygonData from "@/assets/data/yonginplatform1.json";
import type { PolygonFeatureCollection } from "@/services/types";

const DEFAULT_ZOOM = 14;
const VWORLD_KEY = import.meta.env.VITE_VWORLD_API_KEY;

type MapMode = "base" | "satellite";
type WorkerProperties = { workerId: number };
type ClusterFeature = Supercluster.ClusterFeature<Supercluster.AnyProps>;
type PointFeature = Supercluster.PointFeature<WorkerProperties>;
type AnyCluster = ClusterFeature | PointFeature;

interface PopupInfo {
  longitude: number;
  latitude: number;
  ids: number[];
}

// 폴리곤 중간 점 계산
function getPolygonCenter(data: PolygonFeatureCollection) {
  const coords = data.features.flatMap((feature) => feature.geometry.coordinates[0] ?? []);
  if (coords.length === 0) return { longitude: 127.0, latitude: 37.3 };
  let lngSum = 0;
  let latSum = 0;
  for (const [lng, lat] of coords) {
    lngSum += lng ?? 0;
    latSum += lat ?? 0;
  }
  return { longitude: lngSum / coords.length, latitude: latSum / coords.length };
}

// 클러스트 여부 확인 (묶음/개별)
function isCluster(feature: AnyCluster): feature is ClusterFeature {
  return "cluster" in feature.properties && feature.properties.cluster === true;
}

// VWorld 타일 + 폴리곤 레이어 지도 스타일
function getMapStyle(mode: MapMode) {
  const tileUrl =
    mode === "satellite"
      ? `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Satellite/{z}/{y}/{x}.jpeg`
      : `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_KEY}/Base/{z}/{y}/{x}.png`;

  return {
    version: 8 as const,
    sources: {
      gps: { type: "raster" as const, tiles: [tileUrl], tileSize: 256 },
      polygon: {
        type: "geojson" as const,
        data: polygonData as unknown as GeoJSON.FeatureCollection,
      },
    },
    layers: [
      { id: "gps", type: "raster" as const, source: "gps" },
      {
        id: "polygon-fill",
        type: "fill" as const,
        source: "polygon",
        paint: { "fill-color": "#0034FF", "fill-opacity": 0.3 },
      },
      {
        id: "polygon-outline",
        type: "line" as const,
        source: "polygon",
        paint: { "line-color": "#0057FF", "line-width": 3 },
      },
    ],
  };
}

export function GPSMapView() {
  const [mapMode, setMapMode] = useState<MapMode>("satellite");
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [bounds, setBounds] = useState<[number, number, number, number]>([-180, -85, 180, 85]);
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const mapRef = useRef<MapRef>(null);
  const { workers } = useWorkerLocations();

  const center = getPolygonCenter(polygonData as unknown as PolygonFeatureCollection);
  const mapStyle = useMemo(() => getMapStyle(mapMode), [mapMode]);

  const supercluster = useMemo(
    () => new Supercluster<WorkerProperties>({ radius: 100, maxZoom: 40 }),
    []
  );

  // 전체 근무자 목록
  const clusters = useMemo(() => {
    const points = workers.map<Supercluster.PointFeature<WorkerProperties>>((worker) => ({
      type: "Feature",
      id: worker.workerId,
      geometry: { type: "Point", coordinates: [worker.longitude, worker.latitude] },
      properties: { workerId: worker.workerId },
    }));
    supercluster.load(points);
    return supercluster.getClusters(bounds, Math.round(zoom));
  }, [supercluster, workers, bounds, zoom]);

  const updateViewport = () => {
    if (!mapRef.current) return;
    setZoom(mapRef.current.getZoom());
    const newBounds = mapRef.current.getBounds();
    if (newBounds)
      setBounds([
        newBounds.getWest(),
        newBounds.getSouth(),
        newBounds.getEast(),
        newBounds.getNorth(),
      ]);
  };

  const handleMarkerClick = (
    event: { originalEvent: { stopPropagation: () => void } },
    cluster: AnyCluster
  ) => {
    event.originalEvent.stopPropagation();
    const [longitude, latitude] = cluster.geometry.coordinates as [number, number];

    // 마커 클릭 시 클러스터/개별 구분하여 팝업 표시
    if (isCluster(cluster)) {
      const key = String(cluster.properties.cluster_id);
      const leaves = supercluster.getLeaves(cluster.properties.cluster_id, Infinity);
      setSelectedKey(key);
      setPopupInfo({ longitude, latitude, ids: leaves.map((l) => l.properties.workerId) });
    } else {
      const workerId = cluster.properties.workerId;
      setSelectedKey(String(workerId));
      setPopupInfo({ longitude, latitude, ids: [workerId] });
    }
  };

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: center.longitude,
          latitude: center.latitude,
          zoom: DEFAULT_ZOOM,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        onMove={updateViewport}
        onLoad={updateViewport}
        onClick={() => {
          setPopupInfo(null);
          setSelectedKey(null);
        }}
        onZoomEnd={() => {
          setPopupInfo(null);
          setSelectedKey(null);
        }}
      >
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates as [number, number];
          const key = isCluster(cluster)
            ? String(cluster.properties.cluster_id)
            : String((cluster as PointFeature).properties.workerId);
          const isSelected = selectedKey === key;
          const count = isCluster(cluster) ? cluster.properties.point_count : 1;

          return (
            <Marker
              key={key}
              longitude={longitude}
              latitude={latitude}
              onClick={(e) => handleMarkerClick(e, cluster)}
            >
              <div className="flex flex-col items-center cursor-pointer">
                <div
                  className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-sm shadow-lg ${
                    isSelected ? "bg-orange-500" : "bg-white border border-orange-400"
                  }`}
                >
                  <span
                    className={`text-lg font-bold leading-none ${
                      isSelected ? "text-white" : "text-orange-500"
                    }`}
                  >
                    {count > 5 ? "5+" : count}
                  </span>
                  <img
                    src={isSelected ? workerActiveIcon : workerIcon}
                    className="size-4 object-contain"
                    alt="worker"
                  />
                  <div
                    className={`absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
                      isSelected ? "bg-orange-500" : "bg-white border-r border-b border-orange-400"
                    }`}
                  />
                </div>
              </div>
            </Marker>
          );
        })}

        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => {
              setPopupInfo(null);
              setSelectedKey(null);
            }}
            closeButton={false}
            anchor="top-left"
            offset={[-30, 50]}
          >
            <div className="bg-gray-900 rounded overflow-hidden min-w-[10rem] max-h-[15rem] overflow-y-auto">
              {popupInfo.ids.map((id) => {
                return (
                  <div
                    key={id}
                    className="px-4 py-2 border-b border-gray-700 text-sm text-white last:border-0"
                  >
                    <div className="font-medium">근로자 {id}</div>
                  </div>
                );
              })}
            </div>
          </Popup>
        )}
      </Map>

      <div className="absolute top-4 right-4 flex rounded overflow-hidden shadow-lg">
        <button
          className={`px-3 py-1.5 text-sm font-medium ${mapMode === "base" ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
          onClick={() => setMapMode("base")}
        >
          기본
        </button>
        <button
          className={`px-3 py-1.5 text-sm font-medium ${mapMode === "satellite" ? "bg-blue-500 text-white" : "bg-white text-gray-700"}`}
          onClick={() => setMapMode("satellite")}
        >
          위성
        </button>
      </div>
    </div>
  );
}
