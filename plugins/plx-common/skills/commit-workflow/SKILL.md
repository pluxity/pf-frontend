---
name: commit-workflow
description: Git 커밋 워크플로우. 사용자가 "커밋해줘", "커밋 생성", "변경사항 커밋" 등 명시적으로 요청할 때만 사용. 코드 작성 완료 후 자동 실행 금지.
allowed-tools: Read, Bash, Glob, Grep
---

# Git 커밋 워크플로우

$ARGUMENTS 변경사항을 커밋합니다.

> **⚠️ [필수] 커밋 메시지에 `Co-Authored-By` 절대 포함 금지 — 반드시 확인할 것**

---

## 프로젝트 자동 감지

```bash
# 현재 저장소 정보 확인
gh repo view --json nameWithOwner,defaultBranchRef --jq '{repo: .nameWithOwner, branch: .defaultBranchRef.name}'
```

---

## 커밋 워크플로우

```
1. 변경사항 확인 (git status, git diff)
   ↓
2. 스테이징 (git add)
   ↓
3. 커밋 메시지 작성
   ↓
4. 커밋 생성
```

---

## 1단계: 변경사항 확인

```bash
# 변경된 파일 확인
git status

# 변경 내용 확인
git diff

# 스테이징된 변경 확인
git diff --staged
```

---

## 2단계: 커밋 메시지 컨벤션

### 형식

```
#이슈번호 - 타입(스코프): 제목

본문 (선택)

Footer (선택)
```

**중요**: 이슈번호는 제일 앞에 `#번호 - ` 형식으로 작성합니다.

### 타입

| 타입       | 설명      | 예시                                       |
| ---------- | --------- | ------------------------------------------ |
| `feat`     | 새 기능   | #123 - feat(ui): Button 컴포넌트 추가      |
| `fix`      | 버그 수정 | #456 - fix(map): 마커 클릭 이벤트 수정     |
| `docs`     | 문서      | #789 - docs: README 업데이트               |
| `style`    | 포맷팅    | #101 - style: 코드 포맷 정리               |
| `refactor` | 리팩토링  | #202 - refactor(core): API 클라이언트 개선 |
| `perf`     | 성능 개선 | #303 - perf(ui): Table 가상화 적용         |
| `test`     | 테스트    | #404 - test(ui): Button 테스트 추가        |
| `chore`    | 빌드/설정 | #505 - chore: 의존성 업데이트              |

### 스코프 (선택)

```
- ui: @pf-dev/ui 패키지
- map: @pf-dev/map 패키지
- three: @pf-dev/three 패키지
- cctv: @pf-dev/cctv 패키지
- services: @pf-dev/services 패키지
- app명: 특정 앱 (yongin-app, yongin-admin 등)
- (생략): 전체 또는 여러 패키지
```

---

## 3단계: 브랜치 네이밍

커밋 전 올바른 브랜치에 있는지 확인합니다.

```bash
# 현재 브랜치 확인
git branch --show-current

# 브랜치 네이밍 규칙
feature/이슈번호-간단설명    # 기능 개발
fix/이슈번호-간단설명        # 버그 수정
docs/간단설명                # 문서
refactor/간단설명            # 리팩토링
chore/간단설명               # 빌드/설정
```

---

## 4단계: 스테이징 & 커밋

### 스테이징

```bash
# 특정 파일만 추가 (권장)
git add src/components/Button.tsx src/components/Button.test.tsx

# 패턴으로 추가
git add src/components/**/*.tsx

# 전체 추가 (주의: .env 등 민감 파일 확인)
git add .
```

### 커밋 생성 (HEREDOC 형식 필수)

```bash
git commit -m "$(cat <<'EOF'
#123 - feat(ui): DatePicker 컴포넌트 추가

- 날짜 선택 기능
- 범위 선택 기능
- 한국어 로케일 지원

Refs #123
EOF
)"
```

### 커밋 예시

```bash
# 단일 기능
git commit -m "#123 - feat(ui): DatePicker 컴포넌트 추가"

# 버그 수정
git commit -m "#456 - fix(map): 3D 모델 로딩 실패 수정"

# 문서 업데이트
git commit -m "#789 - docs: README 업데이트"

# 리팩토링
git commit -m "#101 - refactor(core): API 클라이언트 구조 개선"

# 릴리즈
git commit -m "#204 - chore(release): @pf-dev/ui@1.2.5"
```

---

## 주의사항

- **[필수] `Co-Authored-By` 절대 포함 금지** — 커밋 메시지 어디에도 포함하지 않습니다
- **[필수] 커밋 메시지에 이슈번호 포함** — `#이슈번호 - ` 형식
- 민감한 파일 (.env, credentials 등) 커밋하지 않기
- HEREDOC 형식으로 커밋 메시지 작성 (멀티라인 시)
- 하나의 커밋에 하나의 논리적 변경만 포함
