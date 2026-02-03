# Cesium 전문가 규칙

`@pf-dev/map` 패키지 사용 시 따라야 할 규칙과 패턴입니다.

---

## 1. 성능 규칙

### 1.1 requestRenderMode 필수

모든 MapViewer에 설정:

```tsx
<MapViewer
  options={{
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
  }}
/>
```

### 1.2 Entity 수 기준

| 수량     | API                    | 이유                         |
| -------- | ---------------------- | ---------------------------- |
| < 100    | Entity API             | 간편, 성능 충분              |
| 100-1000 | Entity + show 관리     | 보이지 않는 것은 show: false |
| > 1000   | **Primitive API**      | Entity API는 오버헤드 큼     |
| > 10000  | Primitive + Clustering | 클러스터링 필수              |

### 1.3 3D Tileset 설정

```
maximumScreenSpaceError 기준:
- 고품질: 4-8 (가까이서 볼 때)
- 일반: 16 (기본값)
- 성능 우선: 32-64 (원거리)
```

### 1.4 메모리 관리

- 사용하지 않는 Entity는 `remove()` (show: false가 아님)
- DataSource는 `destroy()` 호출
- ImageryLayer 교체 시 이전 레이어 `remove()` 후 `destroy()`

---

## 2. Feature Store 사용 패턴

### 2.1 Feature 추가

```tsx
addFeature("sensor-001", {
  position: { longitude: 127.0, latitude: 37.5, height: 0 },
  properties: { type: "temperature", status: "active" },
  visual: {
    type: "billboard",
    image: "/icons/sensor.png",
    width: 32,
    height: 32,
    heightReference: HeightReference.CLAMP_TO_GROUND,
  },
  meta: {
    layerName: "sensors",
    tags: ["iot"],
  },
});
```

### 2.2 레이어별 관리

Feature는 반드시 `meta.layerName`으로 그룹화:

```tsx
// 레이어별 일괄 조작
const cctvFeatures = findByLayer("cctv");
cctvFeatures.forEach((f) => updateFeature(f.id, { visual: { show: false } }));
```

### 2.3 상태별 시각 효과

```
active → Ripple (파란색)
warning → Glow (노란색)
error → Silhouette (빨간색)
selected → Outline (흰색)
```

---

## 3. 카메라 제어 규칙

### 3.1 flyTo vs lookAt

| 메서드   | 용도                          |
| -------- | ----------------------------- |
| `flyTo`  | 특정 위치로 이동 (애니메이션) |
| `lookAt` | 현재 위치에서 시점만 변경     |
| `zoomTo` | Entity/Tileset에 자동 맞춤    |

### 3.2 애니메이션 duration 기준

```
같은 도시 내 이동: 1초
다른 도시 이동: 2초
전국 이동: 3초
초기 진입: 0초 (즉시)
```

---

## 4. 좌표계 참조

### 4.1 변환 패턴

```tsx
// 위경도 → Cartesian3
Cesium.Cartesian3.fromDegrees(lng, lat, height);

// Cartesian3 → 위경도
const carto = Cesium.Cartographic.fromCartesian(cartesian3);
const lng = Cesium.Math.toDegrees(carto.longitude);
const lat = Cesium.Math.toDegrees(carto.latitude);

// 화면 좌표 → 지구 위 좌표
viewer.camera.pickEllipsoid(screenPos, viewer.scene.globe.ellipsoid);
```

### 4.2 한국 좌표 범위

```
경도: 124.5 ~ 132.0
위도: 33.0 ~ 43.0
용인: 127.0, 37.2
```

---

## 5. Provider 선택 가이드

| 용도        | Provider             | 설정                           |
| ----------- | -------------------- | ------------------------------ |
| 개발/테스트 | OSM                  | `provider="osm"`               |
| 한국 위성   | VWorld               | `provider="vworld"` + API 키   |
| 글로벌      | Cesium Ion           | `provider="cesium-ion"` + 토큰 |
| 지형        | Cesium World Terrain | `provider="cesium-world"`      |
| 지형 없이   | Ellipsoid            | `provider="ellipsoid"`         |

---

## 6. 안티패턴

```tsx
// ❌ viewer를 직접 조작
viewer.entities.add({ ... });

// ✅ Feature Store 사용
useFeatureStore().addFeature("id", { ... });

// ❌ 매 렌더마다 Entity 재생성
useEffect(() => {
  viewer.entities.add(...)  // 리렌더마다 중복 추가
}, [data]);

// ✅ ID 기반 업데이트
useEffect(() => {
  data.forEach(item => {
    if (findFeature(item.id)) {
      updateFeature(item.id, ...);
    } else {
      addFeature(item.id, ...);
    }
  });
}, [data]);
```
