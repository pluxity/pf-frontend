# @pf-dev/cctv

CCTV 및 실시간 영상 스트리밍을 위한 React 패키지입니다.
HLS, WHEP 프로토콜을 지원합니다.

## 설치

```bash
pnpm add @pf-dev/cctv
```

## 패키지 구조

```
packages/cctv/
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── hls/           # hls.js 기반 HLS 스트리밍
│   ├── whep/          # WebRTC HTTP Egress Protocol
│   └── components/    # Headless 컴포넌트
└── package.json
```

## 사용법

### 초기 설정

패키지는 **전체 스트림 URL을 직접 사용**하므로, 초기 설정이 매우 간단합니다.

```typescript
// App.tsx 또는 main.tsx
import { useWHEPStore } from "@pf-dev/cctv";

// WHEP만 초기화 필요
useWHEPStore.getState().initialize();

// HLS는 초기 설정 완전 불필요!
```

### 개별 Hook 사용

#### HLS

```typescript
import { useHLSStream } from '@pf-dev/cctv';

function HLSPlayer({ streamUrl }: { streamUrl: string }) {
  const { videoRef, status, error, stats, load, destroy } = useHLSStream(streamUrl);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      <p>Status: {status}</p>
      <p>Bitrate: {stats.bitrate} kbps</p>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

// 사용 예시
<HLSPlayer streamUrl="http://192.168.10.181:8120/CCTV-TEST-001/index.m3u8" />
```

#### WHEP

```typescript
import { useWHEPStream } from '@pf-dev/cctv';

function WHEPPlayer({ streamUrl }: { streamUrl: string }) {
  const { videoRef, status, error, connect, disconnect } = useWHEPStream(streamUrl);

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted />
      <p>Status: {status}</p>
      {error && <p>Error: {error}</p>}
    </div>
  );
}

// 사용 예시
<WHEPPlayer streamUrl="http://192.168.10.181:8117/CCTV-TEST-001/whep" />
```

### CCTVPlayer Headless 컴포넌트

프로토콜에 관계없이 통일된 인터페이스로 사용할 수 있는 headless 컴포넌트입니다.
Render props 패턴을 사용하여 완전한 UI 커스터마이징이 가능합니다.

```tsx
import { CCTVPlayer } from "@pf-dev/cctv";

function CustomPlayer() {
  return (
    <CCTVPlayer streamUrl="http://192.168.10.181:8120/CCTV-TEST-001/index.m3u8" protocol="hls">
      {({ videoRef, status, error, connect, disconnect }) => (
        <div className="player-container">
          <video ref={videoRef} autoPlay playsInline muted />

          {status === "connecting" && <div className="spinner" />}
          {status === "failed" && (
            <div className="error">
              <p>{error}</p>
              <button onClick={connect}>재연결</button>
            </div>
          )}

          <div className="controls">
            <button onClick={disconnect}>연결 해제</button>
          </div>
        </div>
      )}
    </CCTVPlayer>
  );
}
```

**여러 미디어 서버 사용 예시:**

```tsx
// 서버1의 CCTV
<CCTVPlayer
  streamUrl="http://server1.com:8120/CCTV-001/index.m3u8"
  protocol="hls"
>
  {(props) => <VideoPlayer {...props} />}
</CCTVPlayer>

// 서버2의 CCTV
<CCTVPlayer
  streamUrl="http://server2.com:8117/CCTV-002/whep"
  protocol="whep"
>
  {(props) => <VideoPlayer {...props} />}
</CCTVPlayer>
```

#### CCTVPlayer Props

| Prop          | Type                                          | Default | Description       |
| ------------- | --------------------------------------------- | ------- | ----------------- |
| `streamUrl`   | `string`                                      | -       | 전체 스트림 URL   |
| `protocol`    | `'hls' \| 'whep'`                             | -       | 스트리밍 프로토콜 |
| `autoConnect` | `boolean`                                     | `true`  | 자동 연결 여부    |
| `children`    | `(props: CCTVPlayerRenderProps) => ReactNode` | -       | Render props 함수 |

#### Render Props

| Prop         | Type                              | Description                 |
| ------------ | --------------------------------- | --------------------------- |
| `videoRef`   | `RefObject<HTMLVideoElement>`     | 비디오 요소 ref             |
| `status`     | `StreamStatus \| HLSStreamStatus` | 연결 상태                   |
| `error`      | `string \| null`                  | 에러 메시지                 |
| `connect`    | `() => void`                      | 연결 함수                   |
| `disconnect` | `() => void`                      | 연결 해제 함수              |
| `stream`     | `MediaStream \| null`             | 미디어 스트림 (WebRTC/WHEP) |
| `stats`      | `HLSStats \| null`                | 통계 정보 (HLS)             |

## 상태 값

### StreamStatus (WHEP)

- `idle`: 초기 상태
- `connecting`: 연결 중
- `connected`: 연결됨
- `failed`: 연결 실패

### HLSStreamStatus (HLS)

- `idle`: 초기 상태
- `loading`: 로딩 중
- `playing`: 재생 중
- `buffering`: 버퍼링 중
- `error`: 에러 발생

## 설정 옵션

### HLSConfig

```typescript
interface HLSConfig {
  autoReconnect?: boolean; // 자동 재연결 (기본값: true)
  reconnectDelay?: number; // 재연결 대기 시간 (기본값: 5000ms)
  maxReconnectAttempts?: number; // 최대 재연결 시도 (기본값: 3)
}
```

**참고:** HLS는 `streamUrl`을 직접 사용하므로 `serverUrl` 설정이 불필요합니다.

### WHEPConfig

```typescript
interface WHEPConfig {
  iceServers?: IceServerConfig[]; // ICE 서버 목록
  autoReconnect?: boolean; // 자동 재연결 (기본값: true)
  reconnectDelay?: number; // 재연결 대기 시간 (기본값: 5000ms)
  maxReconnectAttempts?: number; // 최대 재연결 시도 (기본값: 3)
}
```

**참고:** WHEP는 `streamUrl`을 직접 사용하므로 `serverUrl` 설정이 불필요합니다.

## 정리 (Cleanup)

컴포넌트 언마운트 시 또는 앱 종료 시 리소스를 정리합니다.

```typescript
// 개별 정리
useHLSStore.getState().destroyAll();
useWHEPStore.getState().cleanup();
```

## 프로토콜별 상세 설명

### HLS (HTTP Live Streaming)

**특징:**

- HTTP 기반 적응형 스트리밍
- hls.js 라이브러리 사용 (Safari는 네이티브 지원)
- LL-HLS (Low Latency HLS) 최적화 적용
- 레이턴시: 약 1-3초 (LL-HLS 설정 기준)

**사용 시나리오:**

- 광범위한 브라우저 호환성이 필요한 경우
- CDN을 통한 대규모 배포
- 네트워크 대역폭 적응형 스트리밍

**초기화:**

```typescript
// HLS는 초기 설정이 불필요합니다!
// streamUrl을 직접 전달하면 됩니다.
```

**URL 형식 예시:**

```
http://192.168.10.181:8120/CCTV-TEST-001/index.m3u8
http://server1.com:8120/CCTV-002/index.m3u8
http://server2.com:8888/stream/live.m3u8
```

**LL-HLS 최적화 설정:**

패키지는 Low Latency HLS를 위해 다음과 같이 최적화되어 있습니다:

```typescript
{
  lowLatencyMode: true,
  maxBufferLength: 4,              // 4초만 버퍼링
  maxMaxBufferLength: 6,           // 최대 6초
  liveSyncDuration: 0.5,           // 라이브 엣지에서 0.5초 유지
  liveMaxLatencyDuration: 3,       // 최대 3초 지연 허용
  backBufferLength: 10,            // 백버퍼 10초
  maxBufferHole: 0.3,              // 0.3초 버퍼 홀 허용
  highBufferWatchdogPeriod: 1,     // 1초마다 버퍼 감시
}
```

**브라우저 지원:**

- Chrome/Edge/Firefox: hls.js 사용
- Safari (macOS/iOS): 네이티브 HLS 지원

---

### WHEP (WebRTC HTTP Egress Protocol)

**특징:**

- HTTP POST를 통한 간소화된 WebRTC 연결
- 시그널링 서버 불필요 (HTTP 요청으로 SDP 교환)
- 낮은 레이턴시 (WebRTC 수준)
- 표준 RFC 9562

**사용 시나리오:**

- WebSocket 시그널링 없이 WebRTC를 사용하고 싶은 경우
- 간단한 수신 전용(receive-only) 스트리밍
- 표준 HTTP 인프라 활용

**초기화:**

```typescript
import { useWHEPStore } from "@pf-dev/cctv";

// WHEP는 initialize()만 호출하면 됩니다
useWHEPStore.getState().initialize();

// ICE 서버 설정이 필요한 경우 (선택사항)
useWHEPStore.getState().setConfig({
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  autoReconnect: true,
  reconnectDelay: 5000,
  maxReconnectAttempts: 3,
});
```

**URL 형식 예시:**

```
http://192.168.10.181:8117/CCTV-TEST-001/whep
http://server1.com:8117/CCTV-002/whep
http://server2.com:9000/stream/live/whep
```

**연결 과정:**

1. RTCPeerConnection 생성
2. Offer SDP 생성
3. HTTP POST로 Offer 전송
4. Answer SDP 수신
5. PeerConnection 수립
6. 미디어 스트림 수신

---

## 프로토콜 비교

| 항목              | HLS (LL-HLS)  | WHEP                  |
| ----------------- | ------------- | --------------------- |
| **레이턴시**      | 1-3초         | ~1초                  |
| **브라우저 지원** | 모든 브라우저 | 최신 브라우저         |
| **방화벽 통과**   | 쉬움 (HTTP)   | 중간 (STUN/TURN 필요) |
| **시그널링**      | 불필요        | 불필요 (HTTP)         |
| **확장성**        | 높음 (CDN)    | 중간                  |
| **대역폭 적응**   | 우수 (ABR)    | 제한적                |
| **구현 복잡도**   | 중간          | 낮음                  |
| **초기 설정**     | 불필요        | initialize()만        |

**선택 가이드:**

- **초저지연 (<1초)**: WHEP 선택
- **호환성 + 안정성 + CDN**: HLS 선택
- **대규모 배포**: HLS 선택
- **간단한 P2P 연결**: WHEP 선택

---

## 의존성

- `react` >= 18
- `zustand` >= 5
- `hls.js` >= 1.5
