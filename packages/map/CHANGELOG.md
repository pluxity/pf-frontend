# @pf-dev/map

## 0.1.1

### Patch Changes

- dec5005: featureStore 동적 Entity 업데이트 지원
  - ModelVisual에 runAnimations 옵션 추가
  - addFeature/addFeatures에서 초기 orientation 설정 지원
  - CallbackProperty 기반 실시간 위치/방향 업데이트 메서드 추가
    - setDynamicPosition: 동적 위치 콜백 설정
    - setDynamicOrientation: 동적 방향 콜백 설정
    - clearDynamicPosition: 동적 위치를 정적으로 전환
    - clearDynamicOrientation: 동적 방향을 정적으로 전환
