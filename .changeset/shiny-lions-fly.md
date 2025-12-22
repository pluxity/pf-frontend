---
"@pf-dev/three": minor
---

feat(assetStore): addAssets 배치 API 추가

- 여러 Asset을 한 번에 등록하고 로드 완료까지 대기
- Promise.all로 병렬 로드
- 로드 실패 시 console.warn + 계속 진행
