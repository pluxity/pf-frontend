import { Outlet } from "react-router-dom";
import { Button, User } from "@pf-dev/ui";
import { NoticeMarquee } from "../components/NoticeMarquee";
import { DateTime } from "../components/DateTime";

export function RootLayout() {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="h-[var(--header-height)] px-3 bg-[#eff1f8] backdrop-blur-lg 4k:h-[var(--header-height-4k)] 4k:px-6">
        <div className="flex h-full items-center">
          <h1 className="flex-1 flex justify-start">
            <img
              src={`${import.meta.env.BASE_URL}assets/images/ci.png`}
              alt="HOBAN CI"
              className="h-10 aspect-[504/87] 4k:h-25"
            />
          </h1>
          <div className="flex-1 flex flex-col items-center gap-2 h-full 4k:gap-8">
            <div className="w-130 h-2 bg-white rounded-b-full shadow-[0_0_5px_0_#bac3e8] 4k:h-6 4k:w-330" />
            <div className="font-extrabold text-3xl 4k:text-7xl">
              용인 플랫폼 시티 1공구 스마트 건설
            </div>
          </div>
          <nav className="flex-1 flex justify-end items-center gap-4 4k:gap-10">
            <DateTime />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window.location.href = "/admin")}
              className="bg-white 4k:w-26 4k:h-26"
            >
              <User size="lg" className="text-gray-600 4k:scale-300" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-[#d6e1f4]/70">
        <Outlet />
      </main>

      {/* Footer (optional) */}
      <footer className="flex overflow-hidden items-center h-[var(--footer-height)] 4k:h-[var(--footer-height-4k)] px-4 bg-[#eff1f8] 4k:px-8">
        <div className="flex items-center gap-4 4k:gap-8">
          <Button className="rounded-full 4k:text-4xl 4k:h-20 4k:px-10">안내사항</Button>
          <div className="flex-1 overflow-hidden">
            <NoticeMarquee />
          </div>
        </div>
      </footer>
    </div>
  );
}
