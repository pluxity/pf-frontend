import { useState } from "react";
import {
  Header,
  OverviewPanel,
  EventLog,
  EventSnapshotPanel,
  VideoSearchButton,
  CCTVDropdown,
} from "@/components";
import { MqttDebugPanel } from "@/components/debug";
import { useMqttEventLog, MQTT_EVENT_TOPIC } from "@/mqtt";
import { CesiumViewer } from "@/cesium";

// 3D Tiles 고도 보정값 (미터 단위)
// 지형 데이터와 3D Tiles 간의 고도 차이를 보정하기 위한 값
const TILESET_HEIGHT_OFFSET = -68;

export function TrackingPage() {
  // MQTT 이벤트 로그 연동
  const { logs } = useMqttEventLog({
    topic: MQTT_EVENT_TOPIC,
  });

  // 지구본(지형) 표시 상태 (기본 off)
  const [showGlobe, setShowGlobe] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">
      {/* 3D Tiles 지형 뷰어 */}
      <div className="fixed inset-0 w-screen h-screen">
        <CesiumViewer heightOffset={TILESET_HEIGHT_OFFSET} showGlobe={showGlobe} />
      </div>

      {/* 헤더 */}
      <Header showGlobe={showGlobe} onToggleGlobe={() => setShowGlobe(!showGlobe)} />

      {/* 좌측 사이드바 */}
      <div className="absolute left-4 top-[4.5rem] bottom-4 w-96 z-30 flex flex-col gap-3">
        {/* 1. 종합상황 패널 */}
        <div className="h-44">
          <OverviewPanel />
        </div>

        {/* 2. 이벤트 로그 패널 - MQTT 연동 */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <EventLog logs={logs} />
        </div>

        {/* 3. 이벤트 스냅샷 패널 */}
        <div className="h-72">
          <EventSnapshotPanel />
        </div>

        {/* 4. 영상기록 검색 버튼 */}
        <div>
          <VideoSearchButton />
        </div>
      </div>

      {/* 우측 상단: CCTV 드롭다운 */}
      <div className="absolute right-4 top-20 z-40">
        <CCTVDropdown />
      </div>

      {/* MQTT 디버그 패널 (개발용) */}
      {import.meta.env.DEV && <MqttDebugPanel />}
    </div>
  );
}
