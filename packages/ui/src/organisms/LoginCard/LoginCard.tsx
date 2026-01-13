import { type Ref } from "react";
import { cn } from "../../utils";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { Checkbox } from "../../atoms/Checkbox";

export interface LoginCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  logo?: React.ReactNode;
  title?: string;
  subtitle?: string;
  onLoginSubmit?: (data: { username: string; password: string; remember: boolean }) => void;
  forgotPasswordHref?: string;
  signUpHref?: string;
  loading?: boolean;
  ref?: Ref<HTMLDivElement>;
  showRememberMe?: boolean;
  defaultRemember?: boolean;
  rememberMeLabel?: string;
  forgotPasswordLabel?: string;
  usernameLabel?: string;
  usernamePlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  submitLabel?: string;
  loadingLabel?: string;
  signUpPrompt?: string;
  signUpLabel?: string;
}

function LoginCard({
  logo,
  title = "환영합니다",
  subtitle = "계정에 로그인하세요",
  onLoginSubmit,
  forgotPasswordHref,
  signUpHref,
  loading = false,
  className,
  showRememberMe = true,
  defaultRemember = false,
  usernameLabel = "아이디",
  passwordLabel = "비밀번호",
  usernamePlaceholder = "아이디를 입력하세요",
  passwordPlaceholder = "••••••••",
  rememberMeLabel = "로그인 상태 유지",
  forgotPasswordLabel = "비밀번호를 잊으셨나요?",
  submitLabel = "로그인",
  loadingLabel = "로그인 중...",
  signUpPrompt = "계정이 없으신가요?",
  signUpLabel = "회원가입",
  ref,
  ...props
}: LoginCardProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onLoginSubmit?.({
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      remember: formData.get("remember") === "on",
    });
  };

  return (
    <div
      ref={ref}
      className={cn(
        "w-full max-w-md rounded-2xl border border-[#E6E6E8] bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.10)]",
        className
      )}
      {...props}
    >
      {logo && <div className="mb-6 flex justify-center">{logo}</div>}

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#1A1A26]">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-[#808088]">{subtitle}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-[#333340]">
              {usernameLabel}
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder={usernamePlaceholder}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[#333340]">
              {passwordLabel}
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={passwordPlaceholder}
              required
              disabled={loading}
            />
          </div>
        </div>
        {(showRememberMe || forgotPasswordHref) && (
          <div className="flex items-center justify-between">
            {showRememberMe && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  name="remember"
                  disabled={loading}
                  defaultChecked={defaultRemember}
                />
                <label htmlFor="remember" className="text-sm text-[#666673]">
                  {rememberMeLabel}
                </label>
              </div>
            )}
            {forgotPasswordHref && (
              <a href={forgotPasswordHref} className="text-sm text-brand hover:underline">
                {forgotPasswordLabel}
              </a>
            )}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? loadingLabel : submitLabel}
        </Button>
      </form>

      {signUpHref && (
        <p className="mt-6 text-center text-sm text-[#666673]">
          {signUpPrompt}{" "}
          <a href={signUpHref} className="font-medium text-brand hover:underline">
            {signUpLabel}
          </a>
        </p>
      )}
    </div>
  );
}

export { LoginCard };
