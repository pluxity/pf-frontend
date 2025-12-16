# @pf-dev/three

React Three Fiber 기반 3D 시각화 패키지

## 설치

```bash
pnpm install
```

## 주요 기능

- ✅ **모델 로딩**: GLTF/GLB, FBX 로더 hooks
- ✅ **모델 관리**: Zustand 기반 상태 관리
- ✅ **카메라 제어**: 카메라 설정 및 위치 저장/복원
- ✅ **유틸리티 Hooks**: Traverse, Raycast, MeshFinder
- ✅ **순수 함수 Utils**: React 의존성 없는 헬퍼 함수
- ✅ **CSS2D 오버레이**: HTML 오버레이 지원

## 사용 방법

### 선언적 방식 (Components)

```typescript
import { Canvas } from '@react-three/fiber';
import { GLTFModel } from '@pf-dev/three';

function Scene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <GLTFModel
        url="/models/building.glb"
        modelId="building"
        position={[0, 0, 0]}
        onLoaded={(gltf) => console.log('Loaded', gltf)}
      />
    </Canvas>
  );
}
```

### 프로그래밍 방식 (Hooks)

```typescript
import { useGLTFLoader, useMeshFinderAll } from '@pf-dev/three';

function Building({ url }) {
  const { scene, animations, progress } = useGLTFLoader(url, {
    autoAddToStore: true,
    onProgress: (p) => console.log(`Loading: ${p}%`),
  });

  const cctvs = useMeshFinderAll(scene, (mesh) =>
    mesh.name.includes('CCTV')
  );

  useEffect(() => {
    console.log('Found CCTVs:', cctvs.length);
  }, [cctvs]);

  return scene ? <primitive object={scene} /> : null;
}
```

### 순수 함수 (Canvas 외부)

```typescript
import { traverseModel, findMeshByName, disposeMesh } from "@pf-dev/three/utils";
import { GLTFLoader } from "three-stdlib";

async function analyzeModel(url: string) {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);

  // CCTV 위치 찾기
  const cctv = findMeshByName(gltf.scene, "CCTV_1");
  console.log("CCTV Position:", cctv?.position);

  // 정리
  disposeScene(gltf.scene);
}
```

### Store 활용

```typescript
import { useModelStore, useCameraStore } from '@pf-dev/three';

function ModelManager() {
  const models = useModelStore((s) => s.getAllModels());
  const disposeModel = useModelStore((s) => s.disposeModel);

  const saveCamera = useCameraStore((s) => s.saveState);
  const restoreCamera = useCameraStore((s) => s.restoreState);

  return (
    <div>
      <h3>Loaded Models: {models.length}</h3>
      {models.map((model) => (
        <div key={model.id}>
          <span>{model.id}</span>
          <button onClick={() => disposeModel(model.id)}>
            Dispose
          </button>
        </div>
      ))}

      <button onClick={() => saveCamera('view1')}>
        Save Camera State
      </button>
      <button onClick={() => restoreCamera('view1')}>
        Restore Camera State
      </button>
    </div>
  );
}
```

## API 참조

### Components

- `<GLTFModel />` - GLTF/GLB 모델 컴포넌트
- `<FBXModel />` - FBX 모델 컴포넌트
- `<CSS2DOverlay />` - HTML 오버레이

### Loaders

- `useGLTFLoader(url, options)` - GLTF 로더 hook
- `useFBXLoader(url, options)` - FBX 로더 hook

### Stores

- `useModelStore` - 모델 상태 관리
- `useCameraStore` - 카메라 상태 관리

### Hooks

- `useModelTraverse(object, callback)` - 모델 순회
- `useRaycast(pointer, options)` - 레이캐스팅
- `useMeshFinder(object, predicate)` - Mesh 찾기

### Utils

- `traverseModel(object, callback)` - 모델 순회 (순수 함수)
- `disposeMesh(mesh)` - Mesh 메모리 정리
- `disposeScene(object)` - Scene 전체 정리
- `findMeshByName(object, name)` - 이름으로 Mesh 찾기
- `getMeshInfo(mesh)` - Mesh 정보 추출

## 라이선스

MIT
