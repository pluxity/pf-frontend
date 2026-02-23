# plx-common

PLUXITY 공통 Git 워크플로우 플러그인. FE/BE 프로젝트 모두에서 사용합니다.

## 스킬 목록 (2개)

| 스킬              | 설명                         | 트리거                         |
| ----------------- | ---------------------------- | ------------------------------ |
| `commit-workflow` | Git 커밋 컨벤션 + 워크플로우 | "커밋해줘", "변경사항 커밋"    |
| `pr-workflow`     | GitHub PR 생성 워크플로우    | "PR 올려줘", "풀리퀘 생성해줘" |

## 핵심 규칙

- **커밋 메시지**: `#이슈번호 - 타입(스코프): 제목`
- **PR은 항상 `--draft`로 생성**
- **`Co-Authored-By` 절대 포함 금지**

## 설치

```bash
claude plugin install ./plugins/plx-common
```
