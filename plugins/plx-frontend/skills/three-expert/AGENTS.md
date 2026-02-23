# Three.js/R3F 전문가 규칙

`@pf-dev/three` 패키지 사용 시 따라야 할 규칙과 패턴입니다.

---

## 1. 성능 규칙

### 1.1 GPU Instancing 기준

| 동일 오브젝트 수 | 방식                      |
| ---------------- | ------------------------- |
| < 10             | 개별 mesh                 |
| 10-100           | 개별 mesh (성능 모니터링) |
| > 100            | **InstancedMesh 필수**    |
| > 10000          | InstancedMesh + LOD       |

### 1.2 frameloop 설정

```tsx
// 실시간 애니메이션 있음 → "always" (기본)
<Canvas frameloop="always">

// 사용자 인터랙션 시에만 → "demand"
<Canvas frameloop="demand">

// 완전 정적 씬 → "never" + invalidate()
<Canvas frameloop="never">
```

### 1.3 렌더링 최적화

```tsx
<Canvas
  gl={{
    antialias: false, // 성능 우선 시
    powerPreference: "high-performance", // GPU 우선
    pixelRatio: Math.min(window.devicePixelRatio, 2), // 최대 2x
  }}
/>
```

### 1.4 폴리곤/텍스처 기준

| 항목           | 권장 한도      |
| -------------- | -------------- |
| 씬 전체 폴리곤 | 100만 이하     |
| 단일 모델      | 10만 이하      |
| 텍스처 크기    | 2048x2048 이하 |
| 텍스처 포맷    | KTX2 (압축)    |
| 모델 포맷      | GLTF + Draco   |

---

## 2. 메모리 관리

### 2.1 dispose 필수

컴포넌트 unmount 시 반드시 리소스 해제:

```tsx
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    if (material.map) material.map.dispose();
  };
}, []);
```

### 2.2 모델 캐싱

동일 모델 여러 번 로드하지 않기:

```tsx
// ✅ useGLTF는 자동 캐싱
const { scene } = useGLTF("/model.glb");

// ✅ 여러 인스턴스가 필요하면 clone
const clone = useMemo(() => scene.clone(), [scene]);
```

### 2.3 씬 정리

```tsx
// traverse로 전체 리소스 해제
scene.traverse((child) => {
  if (child instanceof Mesh) {
    child.geometry.dispose();
    if (child.material instanceof Material) {
      child.material.dispose();
    }
  }
});
```

---

## 3. initializeScene 패턴

`@pf-dev/three`의 Promise 기반 초기화:

```tsx
import { initializeScene } from "@pf-dev/three";

// 씬 준비 완료 후 UI 표시
const scene = await initializeScene({
  models: ["/building.glb", "/ground.glb"],
  onProgress: (progress) => setLoadingProgress(progress),
});
```

---

## 4. Facility/Asset/Feature Store

### 4.1 Store 역할 분리

| Store              | 역할              | 예시                       |
| ------------------ | ----------------- | -------------------------- |
| `useFacilityStore` | 건물/시설 전체    | 건물 모델, 층 정보         |
| `useAssetStore`    | 개별 에셋         | 센서, 장비, CCTV           |
| `useFeatureStore`  | GPU Instance 그룹 | 대량 마커, 포인트 클라우드 |

### 4.2 Feature Domain

대량 인스턴스는 Feature Domain으로 관리:

```tsx
// 도메인 생성 (geometry + material 공유)
createFeatureDomain("trees", {
  geometry: treeGeometry,
  material: treeMaterial,
});

// 인스턴스 추가
addFeatureInstance("trees", "tree-001", {
  position: [10, 0, 5],
  scale: [1, 1.5, 1],
  rotation: [0, Math.random() * Math.PI, 0],
});
```

---

## 5. 인터랙션 규칙

### 5.1 Hover/Select 패턴

```tsx
// hover → outline (노란색, 두께 2)
// select → outline (파란색, 두께 3)
// 동시에 hover + select → select 우선
```

### 5.2 Raycaster 설정

복잡한 모델은 bounding box로 우선 체크:

```tsx
<Canvas
  raycaster={{
    params: {
      Mesh: { threshold: 0.1 },
      Points: { threshold: 0.5 },
    },
  }}
/>
```

---

## 6. 안티패턴

```tsx
// ❌ useFrame에서 state 업데이트
useFrame(() => {
  setPosition([x, y, z]); // 매 프레임 리렌더링!
});

// ✅ ref로 직접 조작
useFrame(() => {
  meshRef.current.position.set(x, y, z);
});

// ❌ 컴포넌트 안에서 geometry/material 생성
function Tree() {
  return (
    <mesh>
      <boxGeometry args={[1, 3, 1]} /> {/* 매 렌더마다 새로 생성 */}
      <meshStandardMaterial color="green" />
    </mesh>
  );
}

// ✅ 재사용 가능하게 외부로
const treeGeo = new BoxGeometry(1, 3, 1);
const treeMat = new MeshStandardMaterial({ color: "green" });

function Tree() {
  return <mesh geometry={treeGeo} material={treeMat} />;
}
```
