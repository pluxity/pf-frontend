import { useState } from "react";
import IonImageryIonTerrain from "./scenarios/IonImageryIonTerrain";
import IonImageryEllipsoidTerrain from "./scenarios/IonImageryEllipsoidTerrain";
import OSMImageryEllipsoidTerrain from "./scenarios/OSMImageryEllipsoidTerrain";
import ArcGISImageryEllipsoidTerrain from "./scenarios/ArcGISImageryEllipsoidTerrain";
import "./App.css";

type Scenario = "ion-ion" | "ion-ellipsoid" | "osm-ellipsoid" | "arcgis-ellipsoid";

const scenarios = [
  { id: "ion-ion" as const, name: "Ion Imagery + Ion Terrain", requiresToken: true },
  { id: "ion-ellipsoid" as const, name: "Ion Imagery + Ellipsoid Terrain", requiresToken: true },
  { id: "osm-ellipsoid" as const, name: "OSM Imagery + Ellipsoid Terrain", requiresToken: false },
  {
    id: "arcgis-ellipsoid" as const,
    name: "ArcGIS Imagery + Ellipsoid Terrain",
    requiresToken: false,
  },
];

export default function App() {
  const [activeScenario, setActiveScenario] = useState<Scenario>("ion-ion");

  return (
    <div className="app">
      <div className="sidebar">
        <h1>Map Scenarios</h1>
        <p className="subtitle">@pf-dev/map 테스트 - 서울 위치</p>

        <div className="scenarios">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              className={`scenario-btn ${activeScenario === scenario.id ? "active" : ""}`}
              onClick={() => setActiveScenario(scenario.id)}
            >
              {scenario.name}
              {scenario.requiresToken && <span className="badge">Ion</span>}
              {!scenario.requiresToken && <span className="badge free">Free</span>}
            </button>
          ))}
        </div>

        <div className="info">
          <h3>현재 시나리오</h3>
          <p>{scenarios.find((s) => s.id === activeScenario)?.name}</p>
          <ul className="features">
            <li>📍 서울역 마커</li>
            <li>📍 강남역 마커</li>
            <li>📍 여의도 마커</li>
            <li>🎯 클러스터링</li>
            <li>🎥 카메라 컨트롤</li>
          </ul>
        </div>
      </div>

      <div className="map-container">
        {activeScenario === "ion-ion" && <IonImageryIonTerrain />}
        {activeScenario === "ion-ellipsoid" && <IonImageryEllipsoidTerrain />}
        {activeScenario === "osm-ellipsoid" && <OSMImageryEllipsoidTerrain />}
        {activeScenario === "arcgis-ellipsoid" && <ArcGISImageryEllipsoidTerrain />}
      </div>
    </div>
  );
}
