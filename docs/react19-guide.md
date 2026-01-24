# React 19 개발 가이드

이 프로젝트는 **React 19**를 사용합니다. 이 문서는 React 19의 주요 변경사항과 권장 패턴을 정리합니다.

---

## 목차

1. [forwardRef 제거](#1-forwardref-제거)
2. [메모이제이션 가이드라인](#2-메모이제이션-가이드라인)
3. [새로운 Hooks](#3-새로운-hooks)
4. [Suspense 활용](#4-suspense-활용)
5. [Document Metadata](#5-document-metadata)

---

## 1. forwardRef 제거

React 19부터 `forwardRef` 없이 ref를 일반 prop으로 전달할 수 있습니다.

### Before (React 18)

```tsx
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => {
    return (
      <div>
        {label && <label>{label}</label>}
        <input ref={ref} {...props} />
      </div>
    );
  }
);
```

### After (React 19)

```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  ref?: React.Ref<HTMLInputElement>;
}

function Input({ label, ref, ...props }: InputProps) {
  return (
    <div>
      {label && <label>{label}</label>}
      <input ref={ref} {...props} />
    </div>
  );
}
```

### useImperativeHandle

```tsx
import { useImperativeHandle, useRef } from "react";

interface TextInputHandle {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

interface TextInputProps {
  ref?: React.Ref<TextInputHandle>;
  placeholder?: string;
}

function TextInput({ ref, placeholder }: TextInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    clear: () => {
      if (inputRef.current) inputRef.current.value = "";
    },
    getValue: () => inputRef.current?.value ?? "",
  }));

  return <input ref={inputRef} placeholder={placeholder} />;
}

// 사용
function Form() {
  const textInputRef = useRef<TextInputHandle>(null);

  return (
    <>
      <TextInput ref={textInputRef} />
      <button onClick={() => textInputRef.current?.focus()}>Focus</button>
      <button onClick={() => textInputRef.current?.clear()}>Clear</button>
    </>
  );
}
```

---

## 2. 메모이제이션 가이드라인

### 핵심 원칙

> **"필요한 경우만 사용하고, 확실하지 않으면 일단 안 쓴다"**

React Compiler가 자동 최적화를 지원하며, 불필요한 메모이제이션은 오히려 성능 저하를 유발합니다.

### 왜 불필요한 메모이제이션이 나쁜가?

#### 1. 오버헤드

```tsx
// useMemo의 실제 동작
function useMemo(factory, deps) {
  // 매 렌더마다 실행됨
  const prevDeps = getPreviousDeps();

  // 의존성 배열 비교 (O(n))
  if (depsChanged(prevDeps, deps)) {
    const value = factory();
    storeDeps(deps);
    storeValue(value);
    return value;
  }

  return getPreviousValue();
}
```

단순한 값이나 함수는 그냥 새로 만드는 게 더 빠릅니다:

```tsx
// ❌ 오버헤드만 추가
const memoizedData = useMemo(() => data, [data]);

// ✅ 이게 더 빠름
const value = data;
```

#### 2. 버그 위험 (Stale Closure)

```tsx
// ❌ 버그: count가 항상 0
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log(count);  // 항상 0 출력!
    setCount(count + 1); // 항상 1로 설정됨
  }, []); // count가 의존성 배열에 없음

  return <button onClick={handleClick}>{count}</button>;
}

// ✅ 그냥 이렇게 쓰면 버그 없음
function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log(count);
    setCount(c => c + 1); // 함수형 업데이트
  };

  return <button onClick={handleClick}>{count}</button>;
}
```

#### 3. 코드 복잡도

```tsx
// ❌ 읽기 어려움
const MemoizedComponent = memo(function Component({ data, onUpdate }) {
  const processedData = useMemo(() => {
    return data.map(item => item);
  }, [data]);

  const handleUpdate = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);

  return <div onClick={() => handleUpdate(1)}>{processedData}</div>;
});

// ✅ 간결하고 명확
function Component({ data, onUpdate }) {
  const processedData = data.map(item => item);

  return <div onClick={() => onUpdate(1)}>{processedData}</div>;
}
```

### 언제 사용해야 하나?

| 상황 | 사용 여부 | 이유 |
|------|----------|------|
| 단순 값/함수 | ❌ | 오버헤드가 더 큼 |
| 복잡한 계산 (O(n²) 이상) | ✅ `useMemo` | 계산 비용이 비교 비용보다 큼 |
| 외부 라이브러리에 전달하는 객체 | ✅ `useMemo` | 참조 동등성 필요 |
| 수천 개 항목 렌더링 컴포넌트 | ✅ `memo` | 리렌더링 비용이 큼 |
| 확실하지 않을 때 | ❌ | 성능 문제 생기면 그때 추가 |

### 올바른 사용 예시

#### 복잡한 계산

```tsx
function SearchResults({ items, query, filters }) {
  // ✅ 복잡한 필터링 + 정렬 + 변환
  const results = useMemo(() => {
    return items
      .filter(item => {
        // 복잡한 필터 로직
        return matchesQuery(item, query) && matchesFilters(item, filters);
      })
      .sort((a, b) => {
        // 복잡한 정렬 로직
        return complexSort(a, b, filters.sortBy);
      })
      .map(item => ({
        ...item,
        highlight: highlightMatches(item.text, query),
      }));
  }, [items, query, filters]);

  return <List data={results} />;
}
```

#### 외부 라이브러리 (Cesium, Three.js)

```tsx
function MapView({ center, zoom, markers }) {
  // ✅ Cesium은 options 객체가 바뀌면 전체 재초기화됨
  const viewerOptions = useMemo(() => ({
    terrainProvider: createWorldTerrain(),
    baseLayerPicker: false,
    geocoder: false,
  }), []); // 한 번만 생성

  // ✅ 카메라 위치도 마찬가지
  const cameraPosition = useMemo(() => ({
    destination: Cartesian3.fromDegrees(center.lng, center.lat, zoom * 1000),
  }), [center.lng, center.lat, zoom]);

  return <CesiumViewer options={viewerOptions} camera={cameraPosition} />;
}
```

#### 무거운 컴포넌트

```tsx
// ✅ 수천 행 테이블
const DataTable = memo(function DataTable({
  data,
  columns,
  onRowClick
}: DataTableProps) {
  // 수천 개의 행 렌더링
  return (
    <table>
      <tbody>
        {data.map(row => (
          <tr key={row.id} onClick={() => onRowClick(row)}>
            {columns.map(col => (
              <td key={col.key}>{row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
});

// ✅ 복잡한 차트
const RevenueChart = memo(function RevenueChart({ data }: ChartProps) {
  // Canvas에 수천 개의 데이터 포인트 렌더링
  return <canvas ref={bindChart(data)} />;
});
```

### 성능 측정 방법

메모이제이션이 정말 필요한지 확인하려면:

```tsx
// 1. React DevTools Profiler 사용
// Components > Profiler > 녹화 시작 > 상호작용 > 결과 확인

// 2. console.time으로 측정
function Component({ items }) {
  console.time('calculation');
  const result = expensiveCalculation(items);
  console.timeEnd('calculation'); // 10ms 이상이면 useMemo 검토

  return <div>{result}</div>;
}

// 3. why-did-you-render 라이브러리
// 불필요한 리렌더링 감지
```

---

## 3. 새로운 Hooks

### use()

Promise나 Context를 렌더링 중에 읽을 수 있습니다. **조건부 사용 가능**합니다.

```tsx
import { use, Suspense } from "react";

// Context 조건부 읽기 (useContext는 불가능)
function ThemeDisplay({ showTheme }: { showTheme: boolean }) {
  if (showTheme) {
    const theme = use(ThemeContext); // ✅ 조건부 가능
    return <div className={theme}>테마 적용됨</div>;
  }
  return <div>기본 스타일</div>;
}

// Promise 읽기
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // Suspense가 로딩 처리
  return <div>{user.name}</div>;
}

// 사용
function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <UserProfile userPromise={fetchUser(userId)} />
    </Suspense>
  );
}
```

### useOptimistic()

낙관적 업데이트를 쉽게 구현합니다. 서버 응답 전에 UI를 먼저 업데이트하고, 실패 시 자동 롤백됩니다.

```tsx
import { useOptimistic, useState, startTransition } from "react";

interface Message {
  id: string;
  text: string;
  sending?: boolean;
}

function Chat({ initialMessages }: { initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);

  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (state, newText: string) => [
      ...state,
      { id: `temp-${Date.now()}`, text: newText, sending: true },
    ]
  );

  async function sendMessage(text: string) {
    // 1. 즉시 UI 업데이트 (낙관적)
    addOptimistic(text);

    // 2. 서버에 전송
    startTransition(async () => {
      try {
        const newMessage = await api.sendMessage(text);
        setMessages(prev => [...prev, newMessage]);
      } catch (error) {
        // 실패 시 자동으로 롤백됨
        console.error("전송 실패:", error);
      }
    });
  }

  return (
    <div>
      {optimisticMessages.map(msg => (
        <div key={msg.id} style={{ opacity: msg.sending ? 0.5 : 1 }}>
          {msg.text}
          {msg.sending && " (전송 중...)"}
        </div>
      ))}
      <input onKeyDown={e => {
        if (e.key === "Enter") {
          sendMessage(e.currentTarget.value);
          e.currentTarget.value = "";
        }
      }} />
    </div>
  );
}
```

### useActionState()

폼 상태와 제출 로직을 깔끔하게 관리합니다.

```tsx
import { useActionState } from "react";

interface FormState {
  error: string | null;
  success: boolean;
}

async function updateProfile(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const name = formData.get("name") as string;

  if (!name.trim()) {
    return { error: "이름을 입력해주세요", success: false };
  }

  try {
    await api.updateProfile({ name });
    return { error: null, success: true };
  } catch {
    return { error: "업데이트에 실패했습니다", success: false };
  }
}

function ProfileForm() {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    { error: null, success: false }
  );

  return (
    <form action={formAction}>
      <input
        name="name"
        placeholder="이름"
        disabled={isPending}
      />
      <button type="submit" disabled={isPending}>
        {isPending ? "저장 중..." : "저장"}
      </button>

      {state.error && (
        <p className="text-red-500">{state.error}</p>
      )}
      {state.success && (
        <p className="text-green-500">저장되었습니다!</p>
      )}
    </form>
  );
}
```

### useFormStatus()

자식 컴포넌트에서 부모 폼의 제출 상태를 읽습니다. Prop drilling 없이 사용 가능합니다.

```tsx
import { useFormStatus } from "react-dom";

// 재사용 가능한 Submit 버튼
function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending, data } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={pending ? "opacity-50" : ""}
    >
      {pending ? (
        <>
          <Spinner className="mr-2" />
          처리 중...
        </>
      ) : (
        children
      )}
    </button>
  );
}

// 사용 - 부모 폼의 상태 자동 감지
function ContactForm() {
  return (
    <form action={submitContact}>
      <input name="email" type="email" required />
      <textarea name="message" required />
      <SubmitButton>문의하기</SubmitButton>
    </form>
  );
}
```

---

## 4. Suspense 활용

데이터 로딩 상태를 선언적으로 처리합니다.

### 기본 사용

```tsx
import { Suspense } from "react";

function Dashboard() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* 각 섹션이 독립적으로 로딩됨 */}
      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>

      <Suspense fallback={<ListSkeleton />}>
        <TopProducts />
      </Suspense>
    </div>
  );
}
```

### 중첩 Suspense

```tsx
function UserProfile({ userId }: { userId: string }) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      {/* 프로필 정보 먼저 로드 */}
      <UserInfo userId={userId} />

      {/* 게시물은 프로필 로드 후 시작 */}
      <Suspense fallback={<p>게시물 로딩 중...</p>}>
        <UserPosts userId={userId} />

        {/* 댓글은 게시물 로드 후 시작 */}
        <Suspense fallback={<p>댓글 로딩 중...</p>}>
          <PostComments userId={userId} />
        </Suspense>
      </Suspense>
    </Suspense>
  );
}
```

### Error Boundary와 함께

```tsx
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

function DataSection() {
  return (
    <ErrorBoundary fallback={<ErrorMessage />}>
      <Suspense fallback={<Loading />}>
        <AsyncData />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## 5. Document Metadata

컴포넌트에서 직접 `<title>`, `<meta>` 등을 설정할 수 있습니다. 자동으로 `<head>`로 이동합니다.

```tsx
function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      {/* 이 태그들은 자동으로 <head>로 이동 */}
      <title>{post.title} | My Blog</title>
      <meta name="description" content={post.excerpt} />
      <meta name="author" content={post.author} />
      <meta property="og:title" content={post.title} />
      <meta property="og:image" content={post.thumbnail} />
      <link rel="canonical" href={`/blog/${post.slug}`} />

      {/* 실제 콘텐츠 */}
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

---

## 마이그레이션 체크리스트

기존 React 18 코드를 React 19로 업데이트할 때:

- [ ] `forwardRef` → ref를 prop으로 변경
- [ ] 불필요한 `useMemo`/`useCallback`/`memo` 검토 및 제거
- [ ] 폼 처리 → `useActionState` + `useFormStatus` 검토
- [ ] 낙관적 UI → `useOptimistic` 검토
- [ ] 조건부 Context → `use()` 검토
- [ ] 로딩 UI → `Suspense` 검토
- [ ] Document metadata → 컴포넌트 내에서 직접 설정

---

## 참고 자료

- [React 19 공식 블로그](https://react.dev/blog/2024/12/05/react-19)
- [React Compiler](https://react.dev/learn/react-compiler)
- [use() Hook](https://react.dev/reference/react/use)
- [useOptimistic](https://react.dev/reference/react/useOptimistic)
- [useActionState](https://react.dev/reference/react/useActionState)
