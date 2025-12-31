import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginCard } from "@pf-dev/ui/organisms";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores";

export function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: { username: string; password: string; remember: boolean }) => {
    setLoading(true);
    try {
      await authService.signIn({
        username: data.username,
        password: data.password,
      });

      const user = await authService.getMe();
      setUser(user);

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      alert("로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <LoginCard
        title="로그인"
        subtitle="계정에 로그인하세요"
        onLoginSubmit={handleLogin}
        loading={loading}
      />
    </div>
  );
}
