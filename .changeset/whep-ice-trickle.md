---
"@pf-dev/cctv": minor
---

WHEP ICE Trickle 지원 추가

- WHEP 표준의 ICE Trickle 확장(RFC 8840) 구현
- SDP Offer에서 ICE credentials 파싱 및 SDP Fragment 생성
- Session URL(Location 헤더) 기반 PATCH로 ICE candidate 전달
- ICE Trickle 미지원 서버에서도 기존과 동일하게 동작 (하위호환)
