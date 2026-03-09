# @pf-dev/cctv

## 0.2.1

### Patch Changes

- WHEP session URL 파싱 시 `new URL(locationHeader, streamUrl)`이 상대 경로 `streamUrl`을 base로 받으면 TypeError를 던지는 문제 수정. try/catch로 감싸서 프록시 환경에서는 ICE trickle을 스킵하고 연결은 정상 동작하도록 변경.

## 0.2.0

### Minor Changes

- 952b54d: WHEP ICE Trickle 지원 추가
  - WHEP 표준의 ICE Trickle 확장(RFC 8840) 구현
  - SDP Offer에서 ICE credentials 파싱 및 SDP Fragment 생성
  - Session URL(Location 헤더) 기반 PATCH로 ICE candidate 전달
  - ICE Trickle 미지원 서버에서도 기존과 동일하게 동작 (하위호환)

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
