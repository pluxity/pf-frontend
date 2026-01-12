import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LoginCard } from "@pf-dev/ui/organisms";
import { Toaster, useToast } from "@pf-dev/ui/molecules";
import { login, useAuthStore, getMe } from "@pf-dev/services";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const { toasts, toast, dismissToast } = useToast();

  const handleLogin = async (data: { username: string; password: string; remember: boolean }) => {
    setLoading(true);
    try {
      await login({ username: data.username, password: data.password });
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
      <LoginCard
        title="관리자 로그인"
        subtitle="관리자 대시보드에 로그인하세요"
        onLoginSubmit={handleLogin}
        loading={loading}
      />
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
