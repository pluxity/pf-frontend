import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sheet, SheetContent } from "@pf-dev/ui/organisms";
import { AdminSidebar } from "./AdminSidebar";
import { Header } from "./Header";

const LG_BREAKPOINT = 1024;

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= LG_BREAKPOINT) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 데스크톱 사이드바 */}
      <div className="hidden lg:block">
        <AdminSidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed} />
      </div>

      {/* 모바일 사이드바 (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0 lg:hidden" showClose={false}>
          <AdminSidebar collapsed={false} onItemClick={closeMobileMenu} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header showMenuButton onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
