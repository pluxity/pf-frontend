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
}

function LoginCard({
  logo,
  title = "Welcome back",
  subtitle = "Sign in to your account",
  onLoginSubmit,
  forgotPasswordHref = "#",
  signUpHref = "#",
  loading = false,
  className,
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
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-[#333340]">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" name="remember" disabled={loading} />
            <label htmlFor="remember" className="text-sm text-[#666673]">
              Remember me
            </label>
          </div>
          <a href={forgotPasswordHref} className="text-sm text-brand hover:underline">
            Forgot password?
          </a>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[#666673]">
        Don't have an account?{" "}
        <a href={signUpHref} className="font-medium text-brand hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}

export { LoginCard };
