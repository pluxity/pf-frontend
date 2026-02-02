# @pf-dev/services

## 0.2.1

### Patch Changes

- 1730ae3: auth 모듈 코드 품질 개선: useRef 콜백 안정화, localStorage 명시적 지정, useShallow 적용

## 0.2.0

### Minor Changes

- 1730ae3: AuthProvider 및 ProtectedRouter 컴포넌트 구현
- 1730ae3: Auth 훅 구현 (useAuth, useLogin, useLogout) 및 authStore, authApi 추가
- 1730ae3: auth 모듈 리팩토링
  - 구조 단순화: 14개 파일 → 7개 파일
  - hooks 제거: useLogin, useLogout, useAuth 삭제
  - API 함수 개별 export: login, logout, refresh, getMe
  - store selectors 추가: selectUser, selectIsLoading, selectIsAuthenticated
  - 문서 추가: README.md, HOW_TO_USE.md

- 1730ae3: @pf-dev/services 패키지 초기 설정 및 Auth 모듈 타입 정의

### Patch Changes

- Updated dependencies [1730ae3]
  - @pf-dev/api@0.1.1
