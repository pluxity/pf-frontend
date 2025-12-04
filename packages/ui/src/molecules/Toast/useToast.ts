import { useState, useCallback } from "react";
import type { VariantProps } from "class-variance-authority";
import type { toastVariants } from "./variants";

type ToastVariant = VariantProps<typeof toastVariants>["variant"];

export interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

type ToastInput = Omit<ToastData, "id">;

interface ToastFunction {
  (input: ToastInput | string): string;
  success: (input: ToastInput | string) => string;
  error: (input: ToastInput | string) => string;
  warning: (input: ToastInput | string) => string;
  info: (input: ToastInput | string) => string;
}

const TOAST_LIMIT = 5;
const DEFAULT_DURATION = 5000;

let toastCount = 0;
const generateId = () => {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return `toast-${toastCount}-${Date.now()}`;
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: ToastInput) => {
    const id = generateId();
    const newToast: ToastData = {
      id,
      duration: DEFAULT_DURATION,
      ...toast,
    };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      return updated.slice(0, TOAST_LIMIT);
    });

    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Base toast function
  const toastFn = useCallback(
    (input: ToastInput | string) => {
      if (typeof input === "string") {
        return addToast({ description: input });
      }
      return addToast(input);
    },
    [addToast]
  );

  // Create toast object with variant methods
  const toast: ToastFunction = Object.assign(toastFn, {
    success: (input: ToastInput | string) => {
      if (typeof input === "string") {
        return addToast({ description: input, variant: "success" });
      }
      return addToast({ ...input, variant: "success" });
    },
    error: (input: ToastInput | string) => {
      if (typeof input === "string") {
        return addToast({ description: input, variant: "error" });
      }
      return addToast({ ...input, variant: "error" });
    },
    warning: (input: ToastInput | string) => {
      if (typeof input === "string") {
        return addToast({ description: input, variant: "warning" });
      }
      return addToast({ ...input, variant: "warning" });
    },
    info: (input: ToastInput | string) => {
      if (typeof input === "string") {
        return addToast({ description: input, variant: "info" });
      }
      return addToast({ ...input, variant: "info" });
    },
  });

  return {
    toasts,
    toast,
    addToast,
    dismissToast,
    dismissAll,
  };
}

export type UseToastReturn = ReturnType<typeof useToast>;
