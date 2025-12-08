# map-sample

`@pf-dev/map` 패키지 테스트용 샘플 애플리케이션입니다.

## 기능

서울 지역을 대상으로 여러 시나리오를 테스트할 수 있습니다:

### 시나리오

1. **Ion Imagery + Ion Terrain** 🔐
   - Cesium Ion 이미지리 (Asset ID: 3830182)
   - Cesium Ion 지형 (Asset ID: 3825983)
   - 고품질 위성 이미지 + 3D 지형
   - Ion 토큰 필요

2. **Ion Imagery + Ellipsoid Terrain** 🔐
   - Cesium Ion 이미지리 (Asset ID: 3830182)
   - 평면 지구 (Ellipsoid)
   - Ion 토큰 필요 (이미지리만)

3. **OSM Imagery + Ellipsoid Terrain** 🆓
   - OpenStreetMap 타일맵
   - 평면 지구 (Ellipsoid)
   - **Ion 토큰 불필요 - 완전 무료**

4. **ArcGIS Imagery + Ellipsoid Terrain** 🆓
   - ArcGIS World Imagery
   - 평면 지구 (Ellipsoid)
   - **Ion 토큰 불필요 - 완전 무료**

### 주요 기능

- 📍 **서울 주요 지점 마커**
  - 서울역
  - 강남역
  - 여의도
  - 남산타워
  - 홍대입구

- 🎯 **마커 클러스터링**
  - 줌 레벨에 따른 자동 그룹화
  - 클릭 시 개별 마커로 확대

- 🎥 **카메라 컨트롤**
  - 서울 상공으로 자동 이동
  - 부드러운 애니메이션 전환

- 💬 **인터랙티브**
  - 마커 클릭 시 알림 표시
  - 콘솔 로그 출력

## 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build
```

## 환경 변수

`.env.local` 파일에 Cesium Ion 토큰을 설정하세요:

```env
VITE_CESIUM_ION_TOKEN=your_ion_token_here
```

> **Note**: OSM 및 ArcGIS 시나리오는 Ion 토큰 없이도 작동합니다.

## 기술 스택

- React 19
- TypeScript
- Vite
- Cesium 1.121.0
- @pf-dev/map

## 라이선스

MIT
