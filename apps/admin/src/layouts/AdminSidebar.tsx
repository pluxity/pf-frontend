import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar } from "@pf-dev/ui/organisms";
import { Home, Users, Settings, Dashboard } from "@pf-dev/ui/atoms";

interface AdminSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onItemClick?: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { label: "홈", path: "/", icon: <Home size="md" /> },
  { label: "대시보드", path: "/dashboard", icon: <Dashboard size="md" /> },
  { label: "사용자 관리", path: "/users", icon: <Users size="md" /> },
  { label: "설정", path: "/settings", icon: <Settings size="md" /> },
];

export function AdminSidebar({ collapsed, onCollapsedChange, onItemClick }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleItemClick = (path: string) => {
    navigate(path);
    onItemClick?.();
  };

  return (
    <Sidebar collapsed={collapsed} onCollapsedChange={onCollapsedChange}>
      <Sidebar.Header title="Admin" logo={null}>
        <Sidebar.CollapseButton iconOnly />
      </Sidebar.Header>

      <nav className="flex-1 overflow-y-auto p-3">
        <Sidebar.Section>
          {menuItems.map((item) => (
            <Sidebar.Item
              key={item.path}
              icon={item.icon}
              active={isActive(item.path)}
              onClick={() => handleItemClick(item.path)}
            >
              {item.label}
            </Sidebar.Item>
          ))}
        </Sidebar.Section>
      </nav>

      <Sidebar.Footer>
        <Sidebar.CollapseButton />
      </Sidebar.Footer>
    </Sidebar>
  );
}
