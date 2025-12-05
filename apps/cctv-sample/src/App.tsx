import { useState } from "react";
import { CCTVPlayer } from "@pf-dev/cctv";
import type { StreamProtocol } from "@pf-dev/cctv";
import "./App.css";

const CCTV_STREAMS = [
  {
    id: "CCTV-TEST-001",
    name: "CCTV TEST 001",
    hlsUrl: "http://192.168.10.181:8120/CCTV-TEST-001/index.m3u8",
    whepUrl: "http://192.168.10.181:8117/CCTV-TEST-001/whep",
  },
  {
    id: "CCTV-CHEONAN-21",
    name: "CCTV CHEONAN 21",
    hlsUrl: "http://192.168.10.181:8120/CCTV-CHEONAN-21/index.m3u8",
    whepUrl: "http://192.168.10.181:8117/CCTV-CHEONAN-21/whep",
  },
];

function App() {
  const [protocol, setProtocol] = useState<StreamProtocol>("hls");
  const [selectedStream, setSelectedStream] = useState(CCTV_STREAMS[0]);

  return (
    <div className="app">
      <header className="header">
        <h1>CCTV Sample App</h1>
        <p>@pf-dev/cctv 패키지 테스트</p>
      </header>

      <div className="controls">
        <div className="control-group">
          <h3>스트림 선택</h3>
          <select
            value={selectedStream.id}
            onChange={(e) => {
              const stream = CCTV_STREAMS.find((s) => s.id === e.target.value);
              if (stream) setSelectedStream(stream);
            }}
            className="select"
          >
            {CCTV_STREAMS.map((stream) => (
              <option key={stream.id} value={stream.id}>
                {stream.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <h3>프로토콜 선택</h3>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="protocol"
                value="whep"
                checked={protocol === "whep"}
                onChange={(e) => setProtocol(e.target.value as StreamProtocol)}
              />
              WHEP (WebRTC HTTP Egress)
            </label>
            <label>
              <input
                type="radio"
                name="protocol"
                value="hls"
                checked={protocol === "hls"}
                onChange={(e) => setProtocol(e.target.value as StreamProtocol)}
              />
              HLS (HTTP Live Streaming)
            </label>
          </div>
        </div>
      </div>

      <div className="player-container">
        <CCTVPlayer
          streamUrl={protocol === "hls" ? selectedStream.hlsUrl : selectedStream.whepUrl}
          protocol={protocol}
          autoConnect={true}
        >
          {({ videoRef, status, error, connect, disconnect }) => (
            <div className="player">
              <div className="video-wrapper">
                <video ref={videoRef} autoPlay playsInline muted className="video" />

                {status === "connecting" && (
                  <div className="overlay">
                    <div className="spinner" />
                    <p>연결 중...</p>
                  </div>
                )}

                {status === "loading" && (
                  <div className="overlay">
                    <div className="spinner" />
                    <p>로딩 중...</p>
                  </div>
                )}

                {status === "failed" && (
                  <div className="overlay error">
                    <p className="error-message">{error || "연결 실패"}</p>
                    <button onClick={connect} className="button">
                      재연결
                    </button>
                  </div>
                )}

                {status === "error" && (
                  <div className="overlay error">
                    <p className="error-message">{error || "에러 발생"}</p>
                    <button onClick={connect} className="button">
                      재연결
                    </button>
                  </div>
                )}
              </div>

              <div className="info">
                <div className="status-badge" data-status={status}>
                  {status}
                </div>
                <div className="button-group">
                  <button
                    onClick={connect}
                    className="button"
                    disabled={status === "connected" || status === "playing"}
                  >
                    연결
                  </button>
                  <button onClick={disconnect} className="button secondary">
                    연결 해제
                  </button>
                </div>
              </div>
            </div>
          )}
        </CCTVPlayer>
      </div>

      <div className="endpoints">
        <h3>테스트 엔드포인트</h3>
        <div className="endpoint-group">
          <h4>CCTV-TEST-001</h4>
          <div className="endpoint">
            <strong>WHEP:</strong> http://192.168.10.181:8117/CCTV-TEST-001/whep
          </div>
          <div className="endpoint">
            <strong>HLS:</strong> http://192.168.10.181:8120/CCTV-TEST-001/index.m3u8
          </div>
        </div>
        <div className="endpoint-group">
          <h4>CCTV-CHEONAN-21</h4>
          <div className="endpoint">
            <strong>WHEP:</strong> http://192.168.10.181:8117/CCTV-CHEONAN-21/whep
          </div>
          <div className="endpoint">
            <strong>HLS:</strong> http://192.168.10.181:8120/CCTV-CHEONAN-21/index.m3u8
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
