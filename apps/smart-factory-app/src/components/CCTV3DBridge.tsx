import { useEffect, useRef } from "react";
import { useWHEPStream } from "@pf-dev/cctv";
import type { StreamStatus } from "@pf-dev/cctv";
import { useCCTVPopupStore, selectPopups } from "@/stores/cctv.store";
import { getCameraById } from "@/config/cctv.config";
import type { CampusSceneApi, BuildingId } from "@/babylon/types";

interface CCTV3DBridgeProps {
  sceneRef: React.RefObject<CampusSceneApi | null>;
}

/** Map @pf-dev/cctv StreamStatus to our 3D panel status */
function toPanelStatus(s: StreamStatus): "idle" | "connecting" | "connected" | "failed" {
  return s;
}

/**
 * Single WHEP stream bridge — connects one camera to its 3D panel.
 * Renders a hidden <video> element and passes it to Babylon's VideoTexture.
 */
function WHEPBridge({
  cameraId,
  streamUrl,
  sceneRef,
}: {
  cameraId: string;
  streamUrl: string;
  sceneRef: React.RefObject<CampusSceneApi | null>;
}) {
  const { status, videoRef } = useWHEPStream(streamUrl, true);
  const prevStatusRef = useRef<StreamStatus>("idle");

  // Sync stream status → 3D panel status
  useEffect(() => {
    const api = sceneRef.current;
    if (!api) return;

    const panelStatus = toPanelStatus(status);
    api.updateCCTVStatus(cameraId, panelStatus);

    // When connected, pass the video element to Babylon
    if (status === "connected" && prevStatusRef.current !== "connected") {
      const videoEl = videoRef.current;
      if (videoEl) {
        api.setCCTVVideoSource(cameraId, videoEl);
      }
    }

    prevStatusRef.current = status;
  }, [status, cameraId, sceneRef, videoRef]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
    />
  );
}

/**
 * CCTV3DBridge — headless component that:
 * 1. Initializes the WHEP store
 * 2. For each open CCTV popup, opens a 3D panel in Babylon
 * 3. Renders hidden <video> elements with useWHEPStream
 * 4. Passes connected video elements to Babylon's VideoTexture
 */
export function CCTV3DBridge({ sceneRef }: CCTV3DBridgeProps) {
  const popups = useCCTVPopupStore(selectPopups);
  const prevPopupIdsRef = useRef<Set<string>>(new Set());

  // Sync popups → 3D panels (open/close)
  useEffect(() => {
    const api = sceneRef.current;
    if (!api) return;

    const currentIds = new Set(popups.map((p) => p.id));
    const prevIds = prevPopupIdsRef.current;

    // Open new panels
    for (const popup of popups) {
      if (!prevIds.has(popup.id)) {
        const camera = getCameraById(popup.id);
        const buildingId = camera?.buildingId ?? ("main-factory" as BuildingId);
        api.openCCTVPanel(popup.id, popup.label, buildingId, popup.triggeredBy);
      }
    }

    // Close removed panels
    for (const prevId of prevIds) {
      if (!currentIds.has(prevId)) {
        api.closeCCTVPanel(prevId);
      }
    }

    prevPopupIdsRef.current = currentIds;
  }, [popups, sceneRef]);

  // Cleanup all 3D panels on unmount
  useEffect(() => {
    const api = sceneRef.current;
    return () => {
      api?.closeAllCCTVPanels();
    };
  }, [sceneRef]);

  return (
    <>
      {popups.map((popup) => (
        <WHEPBridge
          key={popup.id}
          cameraId={popup.id}
          streamUrl={popup.streamUrl}
          sceneRef={sceneRef}
        />
      ))}
    </>
  );
}
