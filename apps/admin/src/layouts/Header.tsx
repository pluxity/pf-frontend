import { useNavigate } from "react-router-dom";
import { Button, User, Logout, Menu } from "@pf-dev/ui/atoms";
import { Toaster, useToast } from "@pf-dev/ui/molecules";
import { useAuthStore, logout } from "@pf-dev/services";

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const reset = useAuthStore((state) => state.reset);
  const { toasts, toast, dismissToast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      reset();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("로그아웃에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <Button
              variant="secondary"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
              aria-label="메뉴 열기"
            >
              <Menu />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User size="sm" />
              <span>{user.name || user.username}</span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <Logout size="sm" />
            <span className="ml-1.5">로그아웃</span>
          </Button>
        </div>
      </header>
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
