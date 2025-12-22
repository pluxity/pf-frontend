---
"@pf-dev/three": patch
---

feat(featureStore): Feature 등록 시 Asset 로드 상태 검증

- addFeature/addFeatures에 Asset 존재 및 로드 완료 검증 추가
- 검증 실패 시 console.warn + skip 처리
