import { Toaster } from "@pf-dev/ui/molecules";
import { ToastProvider, useToastContext } from "./contexts/ToastContext";
import { AppRoutes } from "./routes";

function AppContent() {
  const { toasts, dismissToast } = useToastContext();

  return (
    <>
      <AppRoutes />
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
