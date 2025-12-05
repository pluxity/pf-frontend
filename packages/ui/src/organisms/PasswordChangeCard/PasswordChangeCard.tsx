import { type HTMLAttributes, type Ref, useState } from "react";
import { Lock } from "../../atoms/Icon";
import { cn } from "../../utils";

export interface PasswordChangeCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  ref?: Ref<HTMLDivElement>;
  title?: string;
  subtitle?: string;
  newPasswordLabel?: string;
  newPasswordPlaceholder?: string;
  confirmPasswordLabel?: string;
  confirmPasswordPlaceholder?: string;
  submitButtonText?: string;
  onSubmit?: (newPassword: string, confirmPassword: string) => void;
  isLoading?: boolean;
  error?: string;
}

function PasswordChangeCard({
  className,
  ref,
  title = "비밀번호 변경",
  subtitle = "새로운 비밀번호를 입력해주세요.",
  newPasswordLabel = "새 비밀번호",
  newPasswordPlaceholder = "8자 이상 입력",
  confirmPasswordLabel = "비밀번호 확인",
  confirmPasswordPlaceholder = "비밀번호 재입력",
  submitButtonText = "비밀번호 변경",
  onSubmit,
  isLoading = false,
  error,
  ...props
}: PasswordChangeCardProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(newPassword, confirmPassword);
  };

  return (
    <div
      ref={ref}
      className={cn("w-full max-w-[400px] rounded-xl bg-white p-6 shadow-lg", className)}
      {...props}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">{newPasswordLabel}</label>
          <div className="relative">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={newPasswordPlaceholder}
              className={cn(
                "h-11 w-full rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm",
                "placeholder:text-gray-400",
                "focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              )}
            />
            <Lock size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">{confirmPasswordLabel}</label>
          <div className="relative">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={confirmPasswordPlaceholder}
              className={cn(
                "h-11 w-full rounded-lg border border-gray-200 bg-white px-4 pr-10 text-sm",
                "placeholder:text-gray-400",
                "focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              )}
            />
            <Lock size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "h-11 w-full rounded-lg bg-brand text-sm font-bold text-white",
            "hover:bg-brand-dark transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {isLoading ? "처리 중..." : submitButtonText}
        </button>
      </form>
    </div>
  );
}

export { PasswordChangeCard };
