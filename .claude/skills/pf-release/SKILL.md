---
name: pf-release
description: 버전 릴리즈 플로우. "릴리즈", "버전", "배포", "태그" 요청 시 사용.
allowed-tools: Read, Bash, Glob
---

# PF 릴리즈 플로우

$ARGUMENTS 버전 릴리즈를 진행합니다.

---

## 릴리즈 플로우

```
1. 릴리즈 준비 확인
   ↓
2. Changeset 작성
   ↓
3. 버전 업데이트
   ↓
4. Git 태그 생성
   ↓
5. 배포
   ↓
6. 릴리즈 노트 작성
```

---

## 1단계: 릴리즈 준비 확인

### 체크리스트

```bash
# 1. main 브랜치 최신화
git checkout main
git pull

# 2. 빌드 확인
pnpm build

# 3. 린트 확인
pnpm lint

# 4. 변경사항 확인
git log --oneline $(git describe --tags --abbrev=0)..HEAD
```

### 릴리즈 가능 조건
- [ ] 모든 CI 통과
- [ ] 스테이징 테스트 완료
- [ ] 크리티컬 버그 없음
- [ ] 릴리즈 노트 준비됨

---

## 2단계: Changeset 작성

### Changeset 생성

```bash
pnpm changeset
```

### 프롬프트 응답

```
? Which packages would you like to include?
  ◉ @pf-dev/ui
  ◉ @pf-dev/map
  ◯ @pf-dev/three

? Which packages should have a major bump?
  (none - minor로 진행)

? Which packages should have a minor bump?
  ◉ @pf-dev/ui
  ◉ @pf-dev/map

? Summary
  > feat: 새로운 Button variant 추가, Map 성능 개선
```

### Changeset 파일 확인

```bash
cat .changeset/*.md
```

```markdown
---
"@pf-dev/ui": minor
"@pf-dev/map": minor
---

feat: 새로운 Button variant 추가, Map 성능 개선

- Button에 'link' variant 추가
- MapViewer requestRenderMode 기본값 변경
- 성능 최적화
```

---

## 3단계: 버전 업데이트

```bash
# 버전 업데이트 (changeset에 따라)
pnpm bump

# 변경된 package.json 확인
git diff packages/*/package.json
```

### 버전 규칙

| 변경 유형 | 버전 업 | 예시 |
|----------|---------|------|
| Breaking Change | Major | 1.0.0 → 2.0.0 |
| 새 기능 | Minor | 1.0.0 → 1.1.0 |
| 버그 수정 | Patch | 1.0.0 → 1.0.1 |

---

## 4단계: Git 태그 생성

```bash
# 태그 생성
pnpm tag

# 생성된 태그 확인
git tag --list | tail -5

# 예: @pf-dev/ui@1.2.5, @pf-dev/map@0.1.2
```

### 커밋 & 푸시

```bash
# 버전 업데이트 커밋
git add .
git commit -m "chore: release @pf-dev/ui@1.2.5, @pf-dev/map@0.1.2"

# 태그와 함께 푸시
git push --follow-tags
```

---

## 5단계: 배포

### 자동 배포 (main 푸시 시)

```bash
# GitHub Actions 확인
gh run list --limit 3

# 배포 상태 확인
gh run view [run-id]
```

### 수동 배포 (필요시)

```bash
# 스테이징
pnpm turbo build:staging --filter=앱이름
# scp 또는 배포 스크립트

# 프로덕션
pnpm turbo build:production --filter=앱이름
```

---

## 6단계: 릴리즈 노트 작성

### GitHub Release 생성

```bash
gh release create @pf-dev/ui@1.2.5 \
  --title "@pf-dev/ui v1.2.5" \
  --notes "
## What's New

### Features
- Button에 'link' variant 추가 (#123)
- Select에 검색 기능 추가 (#124)

### Bug Fixes
- Dialog 포커스 트랩 수정 (#125)

### Breaking Changes
- 없음

## Upgrade Guide
\`\`\`bash
pnpm update @pf-dev/ui
\`\`\`
"
```

### 또는 GitHub 웹에서 작성

1. Releases 탭 이동
2. "Draft a new release" 클릭
3. 태그 선택
4. 릴리즈 노트 작성
5. Publish release

---

## 버전별 태그 형식

```
# 패키지 태그
@pf-dev/ui@1.2.5
@pf-dev/map@0.1.2

# 앱 태그 (선택적)
yongin-platform-app@1.0.0
```

---

## 릴리즈 체크리스트

```
[ ] main 브랜치 최신화
[ ] 빌드 성공
[ ] 린트 통과
[ ] Changeset 작성
[ ] 버전 업데이트 (pnpm bump)
[ ] 태그 생성 (pnpm tag)
[ ] 커밋 & 푸시
[ ] CI/CD 통과
[ ] 스테이징 확인
[ ] 프로덕션 배포 (필요시)
[ ] GitHub Release 작성
[ ] 팀 공유
```

---

## 롤백 (문제 발생 시)

```bash
# 이전 버전으로 롤백
git revert HEAD
pnpm install
pnpm build
git push

# 또는 이전 태그로 체크아웃
git checkout @pf-dev/ui@1.2.4
```
