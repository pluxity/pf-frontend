import { useState } from "react";
import {
  useFactoryStore,
  selectActiveScenario,
  selectEmergencyPowerStatus,
} from "@/stores/factory.store";
import type { CampusSceneApi } from "@/babylon/types";
import type { SimulatorControl } from "./BabylonCanvas";
import { FIRE_SCENARIO } from "@/config/fire-scenario.config";

type ScenarioId =
  | "normal"
  | "overload"
  | "blackout"
  | "energy-monitor"
  | "emergency-evacuation"
  | "fire";

interface Scenario {
  id: ScenarioId;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "normal",
    label: "정상 운영",
    description: "모든 계통 정상, 기본 부하",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "#00C48C",
  },
  {
    id: "overload",
    label: "과부하 시뮬레이션",
    description: "본관 계통 부하 90%+ 진입",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    color: "#FFA26B",
  },
  {
    id: "blackout",
    label: "정전 시뮬레이션",
    description: "주계통 단절 → 비상발전기 기동",
    icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 015.636 5.636",
    color: "#DE4545",
  },
  {
    id: "energy-monitor",
    label: "퇴근 후 모니터링",
    description: "본관/물류동 정상 퇴근, 유틸리티/품질동 이상 감지",
    icon: "M3 12h4l3 8 4-16 3 8h4",
    color: "#4D7EFF",
  },
  {
    id: "emergency-evacuation",
    label: "비상 대피",
    description: "대피 경로 시각화 + 경보 뷰 모드",
    icon: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    color: "#FF4444",
  },
  {
    id: "fire",
    label: "화재 시뮬레이션",
    description: "유틸리티동 화재 발생 → 경보 → 대피",
    icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z",
    color: "#FF6600",
  },
];

interface ScenarioPanelProps {
  sceneRef: React.RefObject<CampusSceneApi | null>;
  simulatorRef: React.RefObject<SimulatorControl | null>;
}

export function ScenarioPanel({ sceneRef, simulatorRef }: ScenarioPanelProps) {
  const activeScenario = useFactoryStore(selectActiveScenario);
  const emergencyStatus = useFactoryStore(selectEmergencyPowerStatus);
  const [running, setRunning] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const runScenario = (id: ScenarioId) => {
    if (running) return;
    const api = sceneRef.current;
    const sim = simulatorRef.current;
    if (!api || !sim) return;

    // Reset previous scenario first
    resetScene(api, sim);

    useFactoryStore.getState().setActiveScenario(id);

    if (id === "normal") {
      runNormalScenario(api, sim);
    } else if (id === "overload") {
      runOverloadScenario(api, sim);
    } else if (id === "blackout") {
      runBlackoutScenario(api, sim);
    } else if (id === "energy-monitor") {
      runEnergyMonitorScenario(api, sim);
    } else if (id === "emergency-evacuation") {
      runEmergencyEvacuationScenario(api, sim);
    } else if (id === "fire") {
      runFireScenario(api);
    }
  };

  const resetScene = (api: CampusSceneApi, sim: SimulatorControl) => {
    // Reconnect all cables
    const disconnected = useFactoryStore.getState().disconnectedCables;
    for (const cableId of disconnected) {
      api.reconnectCable(cableId);
    }
    // Stop emergency power
    api.stopEmergencyPower();
    // Clear zone highlights
    api.clearAllZoneHighlights();
    // Stop fire effects
    api.stopFire();
    // Stop evacuation simulation
    api.stopEvacuation();
    // Hide emergency routes
    api.hideEmergencyRoute();
    // Reset view mode
    api.setViewMode("default");
    useFactoryStore.getState().setViewMode("default");
    // Reset simulator
    sim.setScenario(null);
    // Reset store
    useFactoryStore.getState().setActiveScenario(null);
    useFactoryStore.getState().clearAlerts();
    useFactoryStore.getState().clearAnomalies();
    setStatusText(null);
  };

  const runNormalScenario = (api: CampusSceneApi, sim: SimulatorControl) => {
    sim.setScenario("normal");
    setStatusText("정상 운영 모드");
    api.setFlowVisible(true);
    setTimeout(() => setStatusText(null), 2000);
  };

  const runOverloadScenario = (api: CampusSceneApi, sim: SimulatorControl) => {
    setRunning(true);
    setStatusText("본관 계통 부하 증가 중...");

    // Step 1: Switch to overload readings
    sim.setScenario("overload");
    api.setFlowVisible(true);

    // Step 2: After 2s, show status
    setTimeout(() => {
      setStatusText("본관 과부하 감지 — 빌딩 펄스 글로우 활성");
    }, 2000);

    // Step 3: Done after 4s
    setTimeout(() => {
      setStatusText("과부하 시뮬레이션 진행 중");
      setRunning(false);
    }, 4000);
  };

  const runBlackoutScenario = (api: CampusSceneApi, sim: SimulatorControl) => {
    setRunning(true);

    // Step 1: Disconnect main cable (TR → MSB)
    setStatusText("주 계통 차단기 트립!");
    api.disconnectCable("cable-TR-MSB");
    useFactoryStore.getState().disconnectCable("cable-TR-MSB");
    sim.setScenario("blackout");

    // Step 2: After 2s, show cascade
    setTimeout(() => {
      setStatusText("캐스케이드 정전 — 전 계통 전력 상실");
    }, 2000);

    // Step 3: After 4s, start emergency generator
    setTimeout(() => {
      setStatusText("비상 발전기 기동 중...");
      api.startEmergencyPower();
      useFactoryStore.getState().setEmergencyPower("starting");
    }, 4000);

    // Step 4: After 7s, generator running
    setTimeout(() => {
      setStatusText("비상 발전기 가동 — 비상 전력 공급");
      useFactoryStore.getState().setEmergencyPower("running");
      setRunning(false);
    }, 7000);
  };

  const runEnergyMonitorScenario = (api: CampusSceneApi, sim: SimulatorControl) => {
    setRunning(true);
    setStatusText("퇴근 후 모니터링 모드 활성화...");

    const store = useFactoryStore.getState();

    // Step 1: Set to energy-monitor mode + simulated time 19:00 (off-hours)
    sim.setScenario("energy-monitor");
    sim.setSimulatedTime(19);
    api.setFlowVisible(true);
    store.setMonitoringActive(true);

    // Step 2: After 1s — 본관/물류동 장비 idle 상태로 전환 (정상 퇴근)
    setTimeout(() => {
      setStatusText("시뮬레이션 시각: 19:00 (퇴근 후)");

      // 본관 + 물류동: 정상 퇴근 — 장비 idle
      const idleBuildings = new Set(["main-factory", "warehouse"]);
      const currentStore = useFactoryStore.getState();
      for (const [eqId, eq] of currentStore.equipmentMap) {
        if (idleBuildings.has(eq.buildingId ?? "")) {
          api.updateEquipmentStatus(eqId, "idle");
          currentStore.updateEquipmentStatus(eqId, "idle");
        }
      }
    }, 1000);

    // Step 3: After 2.5s — 유틸리티/품질동 이상 경고 표시
    setTimeout(() => {
      setStatusText("유틸리티동/품질동 — 비정상 전력 감지!");

      // 유틸리티 + 품질동: 경고 상태 — 장비 warning + 건물 하이라이트
      const warningBuildings = new Set(["utility", "quality-lab"]);
      const latestStore = useFactoryStore.getState();
      for (const [eqId, eq] of latestStore.equipmentMap) {
        if (warningBuildings.has(eq.buildingId ?? "")) {
          api.updateEquipmentStatus(eqId, "warning");
          latestStore.updateEquipmentStatus(eqId, "warning");
        }
      }

      // 건물 하이라이트: 유틸리티(주황) + 품질동(주황 펄스)
      api.highlightBuilding("utility", "#FFA26B", true);
      api.highlightBuilding("quality-lab", "#FFA26B", true);
    }, 2500);

    // Step 4: Done
    setTimeout(() => {
      setStatusText("퇴근 후 모니터링 진행 중 — 유틸리티/품질동 이상");
      setRunning(false);
    }, 3500);
  };

  const runFireScenario = (api: CampusSceneApi) => {
    setRunning(true);
    setStatusText("화재 시뮬레이션 시작...");

    const { origin, spreadSequence, alarmDelayMs, alertViewDelayMs, evacuationDelayMs } =
      FIRE_SCENARIO;

    // T+0s: Fire breaks out at origin
    api.startFire(origin.buildingId, origin.zoneIndex);
    setStatusText(`${origin.label} — 화재 발생!`);

    // T+2s: Red pulse alarm on origin building
    setTimeout(() => {
      setStatusText(`${origin.label} — 경보 발령`);
      api.startFireAlarm(origin.buildingId);
      api.highlightBuilding(origin.buildingId, "#FF2200", true);
    }, alarmDelayMs);

    // T+3s: Switch to alert view mode
    setTimeout(() => {
      api.setViewMode("alert");
      useFactoryStore.getState().setViewMode("alert");
    }, alertViewDelayMs);

    // T+5s: Evacuation
    setTimeout(() => {
      setStatusText("전 건물 비상 대피 개시");
      api.showAllEmergencyRoutes();
      api.startEvacuation();
    }, evacuationDelayMs);

    // T+8s+: Fire spread sequence
    for (const spread of spreadSequence) {
      setTimeout(() => {
        setStatusText(`화재 확산 — ${spread.label}`);
        api.spreadFire(spread.buildingId, spread.zoneIndex);
      }, spread.delayMs);
    }

    // Final status after all events
    const lastDelay = Math.max(evacuationDelayMs, ...spreadSequence.map((s) => s.delayMs));
    setTimeout(() => {
      setStatusText("화재 시뮬레이션 진행 중");
      setRunning(false);
    }, lastDelay + 2000);
  };

  const runEmergencyEvacuationScenario = (api: CampusSceneApi, _sim: SimulatorControl) => {
    setRunning(true);
    setStatusText("비상 대피 시나리오 시작...");

    // Step 1: Activate alert view mode
    api.setViewMode("alert");
    useFactoryStore.getState().setViewMode("alert");

    // Step 2: After 1s, show all evacuation routes + start simulation
    setTimeout(() => {
      setStatusText("대피 경로 표시 — 전 건물 비상 대피 개시");
      api.showAllEmergencyRoutes();
      api.startEvacuation();
    }, 1000);

    // Step 3: After 2s, highlight all buildings red
    setTimeout(() => {
      setStatusText("전 건물 비상 경보 — 대피 경로 확인");
      api.highlightBuilding("main-factory", "#FF4444", true);
      api.highlightBuilding("warehouse", "#FF4444", true);
      api.highlightBuilding("utility", "#FF4444", true);
      api.highlightBuilding("quality-lab", "#FF4444", true);
    }, 2000);

    // Step 4: Done
    setTimeout(() => {
      setStatusText("비상 대피 시나리오 진행 중");
      setRunning(false);
    }, 3000);
  };

  return (
    <div className="w-64 rounded-lg bg-[#1A1A22]/90 backdrop-blur border border-[#2A2A34] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-[#2A2A34]">
        <h3 className="text-xs font-semibold text-white tracking-wide">시나리오</h3>
      </div>

      {/* Scenario buttons */}
      <div className="p-3 flex flex-col gap-2">
        {SCENARIOS.map((s) => {
          const isActive = activeScenario === s.id;
          return (
            <button
              key={s.id}
              onClick={() => runScenario(s.id)}
              disabled={running}
              className={`flex items-start gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-all ${
                isActive
                  ? "border-2"
                  : running
                    ? "opacity-40 cursor-not-allowed border border-transparent"
                    : "border border-[#2A2A34] hover:border-[#3A3A44] hover:bg-[#1E1E28]"
              }`}
              style={{
                borderColor: isActive ? s.color : undefined,
                backgroundColor: isActive ? `${s.color}10` : undefined,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isActive ? s.color : "#6A6A7A"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0"
              >
                <path d={s.icon} />
              </svg>
              <div className="min-w-0">
                <div
                  className="text-xs font-medium"
                  style={{ color: isActive ? s.color : "#E0E0E0" }}
                >
                  {s.label}
                </div>
                <div className="text-[10px] text-[#6A6A7A] mt-0.5 leading-tight">
                  {s.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Status bar */}
      {(statusText || emergencyStatus !== "standby") && (
        <div className="px-4 py-2 border-t border-[#2A2A34]">
          {statusText && (
            <div className="flex items-center gap-2">
              {running && <div className="w-2 h-2 rounded-full bg-[#FFA26B] animate-pulse" />}
              <span className="text-[10px] text-[#B3B3BA]">{statusText}</span>
            </div>
          )}
          {emergencyStatus !== "standby" && (
            <div className="flex items-center gap-2 mt-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  emergencyStatus === "running" ? "bg-[#00C48C]" : "bg-[#FFA26B] animate-pulse"
                }`}
              />
              <span className="text-[10px] text-[#B3B3BA]">
                비상발전기: {emergencyStatus === "running" ? "가동" : "기동 중"}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
