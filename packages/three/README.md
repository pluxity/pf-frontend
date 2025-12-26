# @pf-dev/three

## 완전한 독립형 React Three Fiber 3D 시각화 패키지

`@pf-dev/three`만 설치하면 `@react-three/fiber`와 `@react-three/drei`를 별도로 설치하지 않아도 3D 앱을 개발할 수 있습니다.

## ✨ 주요 기능

- 🎨 **렌더링 컴포넌트**: Canvas, SceneLighting, SceneGrid, Stats
- 🏗️ **모델 로딩**: GLTFModel, FBXModel
- 🚀 **씬 초기화**: `initializeScene` Promise 기반 초기화 API
- 🎯 **GPU Instancing**: Feature Domain으로 수천 개 인스턴스 최적 렌더링
- 🎨 **메시 인터랙션**: Hover 감지, 아웃라인, 메시 정보
- 💾 **상태 관리**: Zustand 기반 Facility/Asset/Feature Store
- 🛠️ **유틸리티**: Traverse, Raycast, Mesh 찾기, 메모리 관리

## 📦 설치

```bash
pnpm add @pf-dev/three
```

## 🚀 빠른 시작

```tsx
import { Canvas, GLTFModel } from "@pf-dev/three";

function App() {
  return (
    <Canvas lighting="default" grid>
      <GLTFModel url="/model.glb" castShadow receiveShadow />
    </Canvas>
  );
}
```

단 **4줄**로 3D 씬 완성! (Canvas에 OrbitControls 기본 포함)

## 📖 상세 사용법

전체 API 문서와 사용 예시는 **[HOW_TO_USE.md](./HOW_TO_USE.md)**를 참고하세요.

- [빠른 시작 가이드](./HOW_TO_USE.md#-빠른-시작)
- [주요 컴포넌트 사용법](./HOW_TO_USE.md#-주요-컴포넌트)
- [Feature Domain (GPU Instancing)](./HOW_TO_USE.md#-feature-domain-대량-인스턴스-렌더링)
- [메시 인터랙션](./HOW_TO_USE.md#-메시-인터랙션)
- [전체 API 참조](./HOW_TO_USE.md#-api-참조)

## 🔧 개발

```bash
# 설치
pnpm install

# 개발 모드
pnpm dev

# 빌드
pnpm build

# 타입 체크
pnpm type-check

# Lint
pnpm lint
```

## 📝 라이선스

MIT
