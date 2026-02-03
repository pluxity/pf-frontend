# PF 성능 최적화 규칙

pf-dev 프로젝트에 특화된 성능 규칙입니다. 일반적인 React 성능 규칙은 `react-best-practices/AGENTS.md`를 참조하세요.

---

## 1. 번들 최적화 (pf-dev 특화)

### 1.1 무거운 패키지 분리

Cesium, Three.js, hls.js는 반드시 별도 chunk으로 분리:

```ts
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ["react", "react-dom"],
        cesium: ["cesium"],
        three: ["three", "@react-three/fiber", "@react-three/drei"],
        hls: ["hls.js"],
      },
    },
  },
}
```

### 1.2 @pf-dev/ui 직접 import

```tsx
// ❌ barrel import (tree-shaking 불확실)
import { Button, Input, Select } from "@pf-dev/ui";

// ✅ 직접 import
import { Button } from "@pf-dev/ui/atoms/Button";
import { Input } from "@pf-dev/ui/atoms/Input";
```

### 1.3 지도/3D/CCTV는 반드시 lazy load

```tsx
// ✅ 무거운 패키지는 항상 dynamic import
const MapViewer = lazy(() => import("@pf-dev/map").then((m) => ({ default: m.MapViewer })));
const Canvas = lazy(() => import("@pf-dev/three").then((m) => ({ default: m.Canvas })));
const CCTVPlayer = lazy(() => import("@pf-dev/cctv").then((m) => ({ default: m.CCTVPlayer })));
```

---

## 2. Cesium 성능 규칙

### 2.1 requestRenderMode 필수

```tsx
<MapViewer
  options={{
    requestRenderMode: true, // 변경 시에만 렌더
    maximumRenderTimeChange: Infinity,
  }}
/>
```

### 2.2 Entity vs Primitive 기준

| Entity 수 | 권장                        |
| --------- | --------------------------- |
| < 100     | Entity API 사용             |
| 100-1000  | Entity API + show 관리      |
| > 1000    | **Primitive API 전환 필수** |

### 2.3 3D Tileset LOD

```tsx
<Tiles3D
  url="/tiles/tileset.json"
  maximumScreenSpaceError={16} // 높을수록 낮은 LOD (성능↑ 품질↓)
/>
```

### 2.4 불필요한 Entity 정리

```tsx
// ❌ show: false로 숨기기만 하면 메모리 점유
entity.show = false;

// ✅ 필요 없으면 제거
viewer.entities.remove(entity);
```

---

## 3. Three.js 성능 규칙

### 3.1 동일 오브젝트 100개 이상이면 GPU Instancing

```tsx
// ❌ 개별 mesh 100개
{
  items.map((item) => (
    <mesh key={item.id}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  ));
}

// ✅ InstancedMesh
<instancedMesh args={[geometry, material, items.length]}>
  {/* instance matrix 설정 */}
</instancedMesh>;
```

### 3.2 frameloop 설정

```tsx
// 실시간 애니메이션이 없으면 demand 모드
<Canvas frameloop="demand">{/* 변경 시에만 렌더 */}</Canvas>
```

### 3.3 텍스처/모델 최적화

| 항목        | 권장               |
| ----------- | ------------------ |
| GLTF 압축   | Draco 사용         |
| 텍스처 압축 | KTX2 사용          |
| 텍스처 크기 | 2048x2048 이하     |
| 폴리곤 수   | 씬 전체 100만 이하 |

### 3.4 메모리 관리

```tsx
// 컴포넌트 unmount 시 dispose 필수
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  };
}, []);
```

---

## 4. CCTV 스트리밍 성능 규칙

### 4.1 동시 스트림 수 제한

| 프로토콜 | 최대 동시 수 | 이유                    |
| -------- | ------------ | ----------------------- |
| HLS      | 6개          | 브라우저 HTTP 연결 제한 |
| WHEP     | 4개          | WebRTC 피어 연결 부하   |

### 4.2 HLS 버퍼 설정 (지연 vs 안정성)

```tsx
// 저지연 우선 (CCTV 모니터링)
hlsConfig: {
  lowLatencyMode: true,
  liveSyncDurationCount: 2,
  maxBufferLength: 10,
}

// 안정성 우선 (녹화 재생)
hlsConfig: {
  lowLatencyMode: false,
  maxBufferLength: 30,
  maxMaxBufferLength: 60,
}
```

### 4.3 비활성 스트림 해제

화면에 보이지 않는 CCTV는 연결 해제:

```tsx
// IntersectionObserver로 가시성 감지
const { ref, inView } = useInView();

return <div ref={ref}>{inView && <CCTVPlayer url={streamUrl} />}</div>;
```

---

## 5. Zustand 최적화

### 5.1 Selector 필수

```tsx
// ❌ 전체 구독 (불필요한 리렌더링)
const { user, settings, theme } = useStore();

// ✅ 필요한 값만 구독
const user = useStore((state) => state.user);
```

### 5.2 빈번한 업데이트는 transient 패턴

```tsx
// 마우스 좌표처럼 빈번한 업데이트
const positionRef = useRef({ x: 0, y: 0 });

// subscribe로 렌더링 없이 값 추적
useEffect(() => {
  return useMapStore.subscribe(
    (state) => state.cursorPosition,
    (pos) => {
      positionRef.current = pos;
    }
  );
}, []);
```

---

## 6. Vite 빌드 최적화

### 6.1 압축

```ts
import viteCompression from "vite-plugin-compression";

plugins: [viteCompression({ algorithm: "gzip" }), viteCompression({ algorithm: "brotliCompress" })];
```

### 6.2 CSS 최적화

Tailwind CSS v4는 자동 purge. 추가 설정 불필요.

### 6.3 소스맵

```ts
build: {
  sourcemap: false,  // 프로덕션에서는 비활성화
}
```
