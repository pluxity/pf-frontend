import { createContext, useContext, type ReactNode } from "react";
import { useToast, type UseToastReturn } from "@pf-dev/ui/molecules";

const ToastContext = createContext<UseToastReturn | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastUtils = useToast();

  return <ToastContext.Provider value={toastUtils}>{children}</ToastContext.Provider>;
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
}
