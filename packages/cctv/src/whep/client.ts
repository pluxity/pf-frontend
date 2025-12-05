import type { WHEPNegotiationResult } from "./types.ts";

export async function performWhepNegotiation(
  pc: RTCPeerConnection,
  streamUrl: string,
  signal?: AbortSignal
): Promise<WHEPNegotiationResult> {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const response = await fetch(streamUrl, {
    method: "POST",
    headers: { "Content-Type": "application/sdp" },
    body: offer.sdp || "",
    signal,
  });

  if (!response.ok) {
    throw new Error(`WHEP negotiation failed: ${response.status} ${response.statusText}`);
  }

  const answerSdp = await response.text();
  await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

  return { answerSdp };
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
