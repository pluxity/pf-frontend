import { Outlet } from "react-router-dom";
import { Toaster } from "@pf-dev/ui/molecules";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useToastStore } from "@/stores/toast.store";

export function RootLayout() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-[#EFF1F8] to-[#D7D6D9]">
      <Header />

      <main className="flex-1 h-[var(--main-height)] min-h-0 overflow-hidden bg-surface-body/70">
        <Outlet />
      </main>

      <Footer />

      <Toaster toasts={toasts} onDismiss={dismiss} position="bottom-right" />
    </div>
  );
}
