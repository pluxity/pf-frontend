import { Outlet } from "react-router-dom";
import { Toaster } from "@pf-dev/ui/molecules";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { useToastStore } from "@/stores/toast.store";

export function RootLayout() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      className="h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #D4D6D7 0%, #EFF1F8 45%)",
      }}
    >
      <Header />

      <main className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </main>

      <Footer />

      <Toaster toasts={toasts} onDismiss={dismiss} position="bottom-right" />
    </div>
  );
}
