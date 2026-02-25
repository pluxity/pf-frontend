import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input } from "@pf-dev/ui/atoms";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@pf-dev/ui/molecules";
import { cn } from "@pf-dev/ui/utils";
import type { ValidationError } from "@/utils";
import { login, useAuthStore, getMe } from "@pf-dev/services";
import { useToastContext } from "@/contexts/ToastContext";
import { validateLogin } from "./validation";
import { getUsernames } from "./services/loginService";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState("");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [usernames, setUsernames] = useState<string[]>([]);
  const { toast } = useToastContext();

  useEffect(() => {
    const loadUsernames = async () => {
      try {
        const names = await getUsernames();
        setUsernames(names);
      } catch (error) {
        console.error("Failed to load usernames:", error);
        toast.error("사용자 목록을 불러올 수 없습니다");
      }
    };

    loadUsernames();
  }, []);

  const getFieldError = (fieldName: string) => {
    return errors.find((e) => e.field === fieldName)?.message;
  };

  const clearFieldError = (fieldName: string) => {
    setErrors((prev) => prev.filter((e) => e.field !== fieldName));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = selectedUsername;
    const password = formData.get("password") as string;

    // 유효성 검사
    const validationErrors = validateLogin({ username, password });
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    setLoading(true);
    try {
      await login({ username, password });
      const user = await getMe();
      setUser(user);

      // returnUrl 파라미터가 있으면 해당 경로로, 없으면 홈으로 이동
      const returnUrl = searchParams.get("returnUrl");
      navigate(returnUrl || "/", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div
        className={cn(
          "w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-8 shadow-[0_0.5rem_1.5rem_rgba(0,0,0,0.10)]"
        )}
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">관리자 로그인</h1>
          <p className="mt-2 text-sm text-muted">관리자 대시보드에 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-secondary">
                아이디
              </label>
              <Select
                value={selectedUsername}
                onValueChange={(value) => {
                  setSelectedUsername(value);
                  clearFieldError("아이디");
                }}
              >
                <SelectTrigger id="username">
                  <SelectValue placeholder="아이디를 선택하세요." />
                </SelectTrigger>
                <SelectContent>
                  {usernames.map((username) => (
                    <SelectItem key={username} value={username}>
                      {username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {getFieldError("아이디") && (
                <p className="text-sm text-error-brand">{getFieldError("아이디")}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-secondary">
                비밀번호
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                disabled={loading}
                autoComplete="off"
                onChange={() => clearFieldError("비밀번호")}
              />
              {getFieldError("비밀번호") && (
                <p className="text-sm text-error-brand">{getFieldError("비밀번호")}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </div>
    </div>
  );
}
