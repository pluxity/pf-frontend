---
name: pr-workflow
description: GitHub PR 생성 워크플로우. 사용자가 "PR 올려줘", "풀리퀘 생성해줘", "PR 만들어줘" 등 명시적으로 요청할 때만 사용. 코드 작성 완료 후 자동 실행 금지.
allowed-tools: Read, Bash, Glob, Grep
---

# GitHub PR 워크플로우

$ARGUMENTS PR을 생성합니다.

> **⚠️ [필수] PR은 항상 `--draft`로 생성 — 예외 없음**
> **⚠️ [필수] 커밋 메시지에 `Co-Authored-By` 절대 포함 금지**

---

## 프로젝트 자동 감지

```bash
# 현재 저장소 정보 확인
gh repo view --json nameWithOwner,defaultBranchRef --jq '{repo: .nameWithOwner, branch: .defaultBranchRef.name}'
```

---

## PR 워크플로우

```
1. 커밋 완료 확인
   ↓
2. 푸시
   ↓
3. Pre-check (type-check, lint, build)
   ↓
4. PR 생성 (--draft)
   ↓
5. 리뷰 & 머지
```

---

## 1단계: 푸시

```bash
# 첫 푸시 (업스트림 설정)
git push -u origin $(git branch --show-current)

# 이후 푸시
git push
```

---

## 2단계: Pre-check (권장)

```bash
# 1. 타입 체크
pnpm tsc --noEmit

# 2. 린트
pnpm lint

# 3. 빌드
pnpm build

# 4. 테스트 (있는 경우)
pnpm test
```

---

## 3단계: PR 생성

### PR 제목 규칙

커밋 메시지 컨벤션과 동일합니다:

```
#이슈번호 - 타입(스코프): 제목
```

### Feature 템플릿

```bash
gh pr create \
  --draft \
  --title "#이슈번호 - feat(스코프): 제목" \
  --label "enhancement" \
  --body "$(cat <<'EOF'
## 개요
[기능 설명]

## 변경사항
- 변경1
- 변경2

## 스크린샷
[해당시 첨부]

## 테스트
- [ ] 테스트1
- [ ] 테스트2

## 체크리스트
- [ ] 타입 체크 통과
- [ ] 린트 통과
- [ ] 빌드 성공

## 관련 이슈
Closes #이슈번호
EOF
)"
```

### Bug Fix 템플릿

```bash
gh pr create \
  --draft \
  --title "#이슈번호 - fix(스코프): 제목" \
  --label "bug" \
  --body "$(cat <<'EOF'
## 버그 설명
[수정한 버그 설명]

## 원인
[버그 원인]

## 해결 방법
[어떻게 수정했는지]

## 테스트
- [ ] 버그 재현 후 수정 확인
- [ ] 사이드 이펙트 확인

## 체크리스트
- [ ] 타입 체크 통과
- [ ] 린트 통과
- [ ] 빌드 성공

## 관련 이슈
Fixes #이슈번호
EOF
)"
```

### Refactor 템플릿

```bash
gh pr create \
  --draft \
  --title "#이슈번호 - refactor(스코프): 제목" \
  --label "refactor" \
  --body "$(cat <<'EOF'
## 개요
[리팩토링 목적]

## 변경사항
- Before: [이전 구조/방식]
- After: [새로운 구조/방식]

## 영향 범위
[영향받는 파일/컴포넌트]

## 테스트
- [ ] 기존 기능 동작 확인
- [ ] 성능 저하 없음

## 체크리스트
- [ ] 타입 체크 통과
- [ ] 린트 통과
- [ ] 빌드 성공
EOF
)"
```

---

## 4단계: 리뷰 & 머지

### 리뷰어 지정

```bash
# PR 생성 시 리뷰어 지정
gh pr create --draft --reviewer username1,username2

# 이미 생성된 PR에 리뷰어 추가
gh pr edit 123 --add-reviewer username
```

### PR 상태 관리

```bash
# Draft → Ready
gh pr ready 123

# PR 상태 확인
gh pr view 123

# PR 체크 상태 확인
gh pr checks 123
```

### 머지

```bash
# Squash 머지 (권장)
gh pr merge 123 --squash

# 일반 머지
gh pr merge 123 --merge
```

---

## 유용한 명령어

```bash
# 내 PR 목록
gh pr list --author @me

# PR 댓글 추가
gh pr comment 123 --body "리뷰 반영 완료했습니다"

# PR 닫기
gh pr close 123

# PR diff 보기
gh pr diff 123
```

---

## CI/CD 연동

PR 생성 시 자동으로 실행되는 체크:

- TypeScript 타입 체크
- ESLint
- Build 테스트

main 브랜치 머지 시:

- Staging 서버 자동 배포 (deploy-staging 워크플로우)

---

## 주의사항

- **[필수] PR은 항상 `--draft`로 생성** — 리뷰 준비 완료 시 `gh pr ready`로 변경
- **[필수] 커밋 메시지에 `Co-Authored-By` 절대 포함 금지**
- PR 제목은 커밋 컨벤션을 따름 (`#이슈번호 - 타입(스코프): 제목`)
- 큰 변경은 여러 PR로 나누기
- 리뷰어 피드백은 적극적으로 반영
- 머지 전 최신 main과 rebase/merge 권장
