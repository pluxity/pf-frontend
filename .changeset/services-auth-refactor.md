---
"@pf-dev/services": minor
---

auth 모듈 리팩토링

- 구조 단순화: 14개 파일 → 7개 파일
- hooks 제거: useLogin, useLogout, useAuth 삭제
- API 함수 개별 export: login, logout, refresh, getMe
- store selectors 추가: selectUser, selectIsLoading, selectIsAuthenticated
- 문서 추가: README.md, HOW_TO_USE.md
