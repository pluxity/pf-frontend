import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function RootLayout() {
  return (
    <div className="h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-surface-body/70">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
