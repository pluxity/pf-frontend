# 영상 스트리밍 전문가 규칙

`@pf-dev/cctv` 패키지 사용 시 따라야 할 규칙과 패턴입니다.

---

## 1. 프로토콜 선택 의사결정

```
실시간 모니터링이 필요한가?
  ├─ YES → 지연 1초 이하 필요?
  │    ├─ YES → WHEP (WebRTC)
  │    └─ NO → HLS (LL-HLS)
  └─ NO → 녹화 재생?
       ├─ YES → HLS (일반)
       └─ NO → 상황에 맞게 선택
```

| 기준          | HLS            | WHEP          |
| ------------- | -------------- | ------------- |
| 지연시간      | 1-3초 (LL-HLS) | ~1초          |
| 안정성        | 높음           | 보통          |
| 동시 스트림   | 6개            | 4개           |
| 서버 구성     | 간단           | 복잡 (WebRTC) |
| HTTPS 필수    | 아니오         | **예**        |
| 브라우저 호환 | 매우 높음      | 높음          |

---

## 2. 동시 스트림 제한 규칙

### 2.1 최대 수 기준

| 프로토콜 | 최대 동시      | 이유                        |
| -------- | -------------- | --------------------------- |
| HLS      | 6개            | 브라우저 HTTP/2 다중화 한계 |
| WHEP     | 4개            | WebRTC PeerConnection 부하  |
| 혼합     | HLS 4 + WHEP 2 | 리소스 분배                 |

### 2.2 초과 시 전략

```
페이지네이션 (GridLayout carousel 사용):
- 16대 CCTV → 4x4 그리드, 1페이지씩
- 보이는 페이지만 연결, 나머지 해제

썸네일 모드:
- 전체 목록은 정지 이미지
- 선택한 것만 실시간 스트리밍
```

---

## 3. HLS 설정 규칙

### 3.1 실시간 모니터링 (저지연)

```tsx
hlsConfig: {
  lowLatencyMode: true,
  liveSyncDurationCount: 2,
  liveMaxLatencyDurationCount: 5,
  maxBufferLength: 10,
  maxMaxBufferLength: 20,
}
```

### 3.2 안정성 우선 (녹화 재생)

```tsx
hlsConfig: {
  lowLatencyMode: false,
  maxBufferLength: 30,
  maxMaxBufferLength: 60,
  maxBufferHole: 0.5,
}
```

### 3.3 네트워크 불안정 환경

```tsx
hlsConfig: {
  fragLoadingMaxRetry: 6,
  fragLoadingRetryDelay: 1000,
  levelLoadingMaxRetry: 4,
  manifestLoadingMaxRetry: 4,
}
```

---

## 4. 재연결 전략

### 4.1 자동 재연결 규칙

```
1회차: 즉시 재시도
2회차: 3초 후
3회차: 5초 후
4회차: 10초 후
5회차: 30초 후
이후: 사용자에게 수동 재연결 버튼 표시
```

### 4.2 WHEP 재연결

```tsx
useWHEPStream({
  url: whepUrl,
  videoRef,
  reconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  onReconnectFailed: () => {
    // 사용자에게 수동 재연결 UI 표시
  },
});
```

---

## 5. 비활성 스트림 관리

### 5.1 가시성 기반 연결/해제

```tsx
// IntersectionObserver로 화면 밖 스트림 해제
function SmartCCTV({ url }: { url: string }) {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <div ref={ref}>
      {inView ? (
        <CCTVPlayer url={url} protocol="hls" />
      ) : (
        <div className="bg-gray-900 flex items-center justify-center">
          <span>화면 밖</span>
        </div>
      )}
    </div>
  );
}
```

### 5.2 탭 비활성 시

```tsx
// 탭이 비활성화되면 스트림 일시 중지
useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) {
      pause();
    } else {
      play();
    }
  };
  document.addEventListener("visibilitychange", handleVisibility);
  return () => document.removeEventListener("visibilitychange", handleVisibility);
}, []);
```

---

## 6. 환경변수 규칙

```env
# HLS 서버 (포트 8120)
VITE_MEDIA_API_URL=http://192.168.10.181:8120

# WHEP 서버 (포트 8117)
VITE_MEDIA_WHEP_URL=http://192.168.10.181:8117

# PTZ 제어 (있는 경우)
VITE_MEDIA_PTZ_URL=http://192.168.10.181:8117
```

### URL 패턴

```
HLS: {MEDIA_API_URL}/{카메라ID}/index.m3u8
WHEP: {MEDIA_WHEP_URL}/{카메라ID}/whep
```

---

## 7. 안티패턴

```tsx
// ❌ 모든 CCTV를 한 번에 연결
{allCameras.map(cam => <CCTVPlayer key={cam.id} url={cam.url} />)}

// ✅ 보이는 것만 연결 (페이지네이션 또는 가시성)
{visibleCameras.map(cam => <CCTVPlayer key={cam.id} url={cam.url} />)}

// ❌ video 태그 직접 조작
videoElement.srcObject = stream;

// ✅ useHLSStream / useWHEPStream 훅 사용
const { videoRef } = useHLSStream(url);

// ❌ 에러 무시
<CCTVPlayer url={url} />

// ✅ 에러 처리 + 재연결 UI
<CCTVPlayer
  url={url}
  onError={(err) => setError(err)}
  onReconnectFailed={() => setShowRetry(true)}
/>
```
