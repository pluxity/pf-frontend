# 텍스처 맵 활용 가이드

---

## 텍스처 맵 종류

| 맵                  | 용도        | 건설 재질 적용 예시          |
| ------------------- | ----------- | ---------------------------- |
| **map**             | 기본 색상   | 콘크리트 얼룩, 거푸집 나뭇결 |
| **normalMap**       | 표면 요철   | 콘크리트 기포, 크랙          |
| **roughnessMap**    | 부분 거칠기 | 용접 부위 vs 모재            |
| **metalnessMap**    | 부분 금속   | 철근 노출 콘크리트           |
| **aoMap**           | 그림자 강조 | 접합부 깊이감                |
| **displacementMap** | 실제 변형   | 고품질 근접 뷰               |

---

## 텍스처 로딩 (R3F)

```tsx
import { useTexture } from "@react-three/drei";

function ConcreteWall() {
  const textures = useTexture({
    map: "/textures/concrete_diffuse.jpg",
    normalMap: "/textures/concrete_normal.jpg",
  });

  Object.values(textures).forEach((tex) => {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
  });

  return (
    <meshStandardMaterial {...textures} metalness={0} roughness={0.85} envMapIntensity={0.3} />
  );
}
```

---

## 반복 횟수 가이드

| 대상          | 텍스처 해상도 | 권장 repeat |
| ------------- | ------------- | ----------- |
| 외벽 (10m+)   | 2048x2048     | 4~8         |
| 기둥 (0.5~1m) | 1024x1024     | 1~2         |
| 바닥 슬래브   | 2048x2048     | 4~10        |
| 거푸집 패널   | 1024x1024     | 1           |

---

## 무료 PBR 텍스처 소스

| 사이트                          | 추천 카테고리           |
| ------------------------------- | ----------------------- |
| **ambientCG** (ambientcg.com)   | Concrete, Metal, Wood   |
| **Poly Haven** (polyhaven.com)  | Concrete, Gravel, Metal |
| **cgbookcase** (cgbookcase.com) | Concrete, Brick, Ground |

검색: `concrete bare`, `steel galvanized`, `plywood`, `gravel`

---

## 해상도 선택

| 용도        | 해상도    |
| ----------- | --------- |
| 근접 디테일 | 2048x2048 |
| 일반 외벽   | 1024x1024 |
| 먼 배경     | 512x512   |
| 모바일/웹   | 512~1024  |

---

## 재질별 추천 맵 조합

| 재질          | map | normalMap | roughnessMap | aoMap |
| ------------- | --- | --------- | ------------ | ----- |
| 일반 콘크리트 | O   | O         | -            | -     |
| 노출 콘크리트 | O   | O         | O            | O     |
| 철골          | -   | -         | -            | -     |
| 녹슨 철근     | O   | O         | O            | -     |
| 합판 거푸집   | O   | O         | -            | -     |
| 풍화 콘크리트 | O   | O         | O            | O     |
