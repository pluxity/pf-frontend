# CCTV Sample App

`@pf-dev/cctv` 패키지를 테스트하기 위한 샘플 애플리케이션입니다.

## 기능

- WHEP (WebRTC HTTP Egress Protocol) 스트리밍
- HLS (HTTP Live Streaming) 스트리밍
- 프로토콜 전환 (라디오 버튼)
- 연결 상태 표시
- 에러 처리 및 재연결

## 테스트 엔드포인트

- **WHEP**: `http://192.168.10.181:8117/CCTV-TEST-001/whep`
- **HLS**: `http://192.168.10.181:8120/CCTV-TEST-001/index.m3u8`

## 실행 방법

```bash
cd apps/cctv-sample
pnpm dev
```

브라우저에서 http://localhost:5173 접속

## 사용법

1. 프로토콜 선택 (WHEP 또는 HLS)
2. 자동으로 연결되거나 "연결" 버튼 클릭
3. 비디오 스트림 확인
4. "연결 해제" 버튼으로 스트림 중지

## 주요 코드

### 초기 설정 (src/main.tsx)

```typescript
useHLSStore.getState().setConfig({
  serverUrl: "http://192.168.10.181:8120",
});

useWHEPStore.getState().setConfig({
  serverUrl: "http://192.168.10.181:8117",
});
useWHEPStore.getState().initialize();
```

### CCTVPlayer 사용 (src/App.tsx)

```typescript
<CCTVPlayer streamId="CCTV-TEST-001" protocol={protocol} autoConnect={true}>
  {({ videoRef, status, error, connect, disconnect }) => (
    // UI 렌더링
  )}
</CCTVPlayer>
```
