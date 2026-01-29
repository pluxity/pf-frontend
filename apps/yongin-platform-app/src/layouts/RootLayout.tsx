import { Outlet } from "react-router-dom";
import { Button, Settings } from "@pf-dev/ui";
import { Announcement } from "../components/Announcement";
import ciLogo from "../assets/images/ci.svg";
import hobanLogo from "../assets/images/hoban.svg";

export function RootLayout() {
  return (
    <div className="h-screen flex flex-col">
      <header className="h-[var(--header-height)] px-[0.75rem] bg-white">
        <div className="flex h-full items-center">
          <h1 className="flex-1 flex justify-start items-center">
            <img src={ciLogo} alt="경기주택도시공사" className="h-[1.875rem]" />
          </h1>
          <div className="flex-1 flex items-center justify-center gap-[0.75rem]">
            <img src={hobanLogo} alt="HOBAN" className="h-[1.625rem]" />
            <span className="font-extrabold text-[1.25rem]">용인 플랫폼시티 1공구 스마트건설</span>
          </div>
          <nav className="flex-1 flex justify-end items-center gap-[1rem]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window.location.href = "/admin")}
              className="bg-white rounded-lg w-[2.5rem] h-[2.5rem]"
            >
              <Settings size="lg" className="text-gray-600" />
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-[#d6e1f4]/70">
        <Outlet />
      </main>

      <footer className="flex overflow-hidden items-center h-[var(--footer-height)] px-[1rem] bg-[#eff1f8]">
        <Announcement />
      </footer>
    </div>
  );
}
