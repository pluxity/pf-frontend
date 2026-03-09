import type { WHEPNegotiationResult } from "./types";

interface OfferData {
  iceUfrag: string;
  icePwd: string;
  medias: string[];
}

function parseOffer(sdp: string): OfferData {
  const result: OfferData = { iceUfrag: "", icePwd: "", medias: [] };

  for (const line of sdp.split("\r\n")) {
    if (line.startsWith("m=")) {
      result.medias.push(line.slice("m=".length));
    } else if (result.iceUfrag === "" && line.startsWith("a=ice-ufrag:")) {
      result.iceUfrag = line.slice("a=ice-ufrag:".length);
    } else if (result.icePwd === "" && line.startsWith("a=ice-pwd:")) {
      result.icePwd = line.slice("a=ice-pwd:".length);
    }
  }

  return result;
}

function generateSdpFragment(offerData: OfferData, candidates: RTCIceCandidate[]): string {
  const candidatesByMedia: Record<number, RTCIceCandidate[]> = {};
  for (const candidate of candidates) {
    const mid = candidate.sdpMLineIndex ?? 0;
    if (candidatesByMedia[mid] === undefined) {
      candidatesByMedia[mid] = [];
    }
    candidatesByMedia[mid]!.push(candidate);
  }

  let frag = `a=ice-ufrag:${offerData.iceUfrag}\r\n` + `a=ice-pwd:${offerData.icePwd}\r\n`;

  let mid = 0;
  for (const media of offerData.medias) {
    if (candidatesByMedia[mid] !== undefined) {
      frag += `m=${media}\r\n` + `a=mid:${mid}\r\n`;

      for (const candidate of candidatesByMedia[mid]!) {
        frag += `a=${candidate.candidate}\r\n`;
      }
    }
    mid++;
  }

  return frag;
}

function sendLocalCandidates(
  sessionUrl: string,
  offerData: OfferData,
  candidates: RTCIceCandidate[]
): void {
  fetch(sessionUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/trickle-ice-sdpfrag",
      "If-Match": "*",
    },
    body: generateSdpFragment(offerData, candidates),
  }).catch(() => {
    // PATCH 실패는 무시 (연결 자체는 ICE trickle 없이도 동작 가능)
  });
}

export async function performWhepNegotiation(
  pc: RTCPeerConnection,
  streamUrl: string,
  signal?: AbortSignal
): Promise<WHEPNegotiationResult> {
  const offer = await pc.createOffer();
  const offerSdp = offer.sdp || "";
  const offerData = parseOffer(offerSdp);

  let sessionUrl: string | null = null;
  let queuedCandidates: RTCIceCandidate[] = [];

  pc.onicecandidate = (evt) => {
    if (evt.candidate !== null) {
      if (sessionUrl === null) {
        queuedCandidates.push(evt.candidate);
      } else {
        sendLocalCandidates(sessionUrl, offerData, [evt.candidate]);
      }
    }
  };

  await pc.setLocalDescription(offer);

  const response = await fetch(streamUrl, {
    method: "POST",
    headers: { "Content-Type": "application/sdp" },
    body: offerSdp,
    signal,
  });

  if (!response.ok) {
    throw new Error(`WHEP negotiation failed: ${response.status} ${response.statusText}`);
  }

  const locationHeader = response.headers.get("location");
  if (locationHeader) {
    try {
      sessionUrl = new URL(locationHeader, streamUrl).toString();
    } catch {
      console.warn(
        "[WHEP] ICE trickle disabled — cannot resolve session URL from relative streamUrl"
      );
    }
  }

  const answerSdp = await response.text();
  await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

  if (sessionUrl !== null && queuedCandidates.length > 0) {
    sendLocalCandidates(sessionUrl, offerData, queuedCandidates);
    queuedCandidates = [];
  }

  return { answerSdp, sessionUrl };
}

export function createReceiverPeerConnection(
  onVideoStream: (stream: MediaStream) => void,
  iceServers?: RTCIceServer[]
): RTCPeerConnection {
  const pc = new RTCPeerConnection({
    iceServers: iceServers ?? [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  });

  pc.addEventListener("track", (event) => {
    if (event.track.kind === "video" && event.streams[0]) {
      onVideoStream(event.streams[0]);
    }
  });

  pc.addTransceiver("video", { direction: "recvonly" });
  pc.addTransceiver("audio", { direction: "recvonly" });

  return pc;
}
