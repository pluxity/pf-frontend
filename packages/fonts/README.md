# @pf-dev/fonts

모노레포 공유 폰트 패키지. 필요한 폰트만 import하여 번들 크기 최적화.

## 설치

모노레포 내 프로젝트에서:

```json
{
  "dependencies": {
    "@pf-dev/fonts": "workspace:*"
  }
}
```

## 사용법

### 기본 폰트 적용

```tsx
// main.tsx 또는 App.tsx
import "@pf-dev/fonts/pretendard";
```

```css
/* globals.css */
body {
  font-family: "Pretendard Variable", "Pretendard", sans-serif;
}
```

### fontFamily 상수 사용

```tsx
import "@pf-dev/fonts/pretendard";
import { fontFamily } from "@pf-dev/fonts/pretendard";

function App() {
  return <div style={{ fontFamily: fontFamily.pretendard }}>텍스트</div>;
}
```

### 특정 요소에 다른 폰트 적용

```tsx
import "@pf-dev/fonts/pretendard";
import "@pf-dev/fonts/dseg";
import { fontFamily } from "@pf-dev/fonts/dseg";

function Dashboard() {
  return (
    <div>
      <p>일반 텍스트 (Pretendard)</p>
      <span style={{ fontFamily: fontFamily.dseg7 }}>12:34:56</span>
    </div>
  );
}
```

### Tailwind CSS 연동

```css
/* globals.css */
@layer base {
  :root {
    --font-pretendard: "Pretendard Variable", "Pretendard", sans-serif;
    --font-suit: "SUIT Variable", "SUIT", sans-serif;
    --font-dseg7: "DSEG7 Classic", monospace;
    --font-dseg14: "DSEG14 Classic", monospace;
  }
}
```

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-pretendard)"],
        suit: ["var(--font-suit)"],
        dseg7: ["var(--font-dseg7)"],
        dseg14: ["var(--font-dseg14)"],
      },
    },
  },
};
```

```tsx
<span className="font-dseg7">88:88:88</span>
```

## 포함된 폰트

| 폰트           | 용도              | 타입               | 파일 크기 |
| -------------- | ----------------- | ------------------ | --------- |
| **Pretendard** | 한글/영문 범용    | Variable (100-900) | ~2MB      |
| **SUIT**       | 한글 UI           | Variable (100-900) | ~624KB    |
| **DSEG7**      | 7-segment 디지털  | Regular            | ~7KB      |
| **DSEG14**     | 14-segment 디지털 | ~9KB               |

## Exports

```tsx
// 폰트 로드 + CSS import
import "@pf-dev/fonts/pretendard";
import "@pf-dev/fonts/suit";
import "@pf-dev/fonts/dseg";

// fontFamily 상수
import { fontFamily } from "@pf-dev/fonts/pretendard";
// → { pretendard: "'Pretendard Variable', 'Pretendard', ..." }

import { fontFamily } from "@pf-dev/fonts/suit";
// → { suit: "'SUIT Variable', 'SUIT', ..." }

import { fontFamily } from "@pf-dev/fonts/dseg";
// → { dseg7: "'DSEG7 Classic', monospace", dseg14: "'DSEG14 Classic', monospace" }
```

## 라이선스

- Pretendard: OFL-1.1
- SUIT: OFL-1.1
- DSEG: OFL-1.1
