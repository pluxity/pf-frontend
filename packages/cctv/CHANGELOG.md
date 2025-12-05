# @pf-dev/cctv

## 0.1.0

### Minor Changes

- CCTV 스트리밍 패키지 초기 릴리즈
  - HLS (HTTP Live Streaming) 지원
    - hls.js 기반 스트리밍
    - LL-HLS 최적화 (1-3초 레이턴시)
    - 전체 URL 사용으로 다중 서버 지원
    - 자동 재연결 기능
  - WHEP (WebRTC HTTP Egress Protocol) 지원
    - RFC 9562 표준 구현
    - HTTP 기반 WebRTC 연결
    - 시그널링 서버 불필요
    - 자동 재연결 기능
  - CCTVPlayer Headless 컴포넌트
    - Render Props 패턴으로 UI 커스터마이징
    - HLS/WHEP 프로토콜 추상화
    - 자동 연결 및 재연결
  - React Hooks
    - useHLSStream, useWHEPStream
    - useHLSConfig, useWHEPConfig
    - useHLSCleanup, useWHEPCleanup
  - Zustand 기반 상태 관리
    - Stream별 독립적 상태 관리
    - 실시간 통계 (HLS)
