import { create } from "zustand";
import type { ToastData } from "@pf-dev/ui/molecules";

type ToastInput = Omit<ToastData, "id">;

const TOAST_LIMIT = 5;
const DEFAULT_DURATION = 5000;

let toastCount = 0;
const generateId = () => {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return `toast-${toastCount}-${Date.now()}`;
};

interface ToastState {
  toasts: ToastData[];
}

interface ToastActions {
  add: (input: ToastInput | string) => string;
  success: (input: ToastInput | string) => string;
  error: (input: ToastInput | string) => string;
  warning: (input: ToastInput | string) => string;
  info: (input: ToastInput | string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

type ToastStore = ToastState & ToastActions;

function normalizeInput(input: ToastInput | string, variant?: ToastData["variant"]): ToastData {
  const id = generateId();
  if (typeof input === "string") {
    return { id, description: input, duration: DEFAULT_DURATION, variant };
  }
  return { id, duration: DEFAULT_DURATION, ...input, variant: variant ?? input.variant };
}

function createToast(
  set: (fn: (state: ToastState) => Partial<ToastState>) => void,
  input: ToastInput | string,
  variant?: ToastData["variant"]
): string {
  const toast = normalizeInput(input, variant);
  set((state) => ({ toasts: [toast, ...state.toasts].slice(0, TOAST_LIMIT) }));
  return toast.id;
}

export const useToastStore = create<ToastStore>()((set) => ({
  toasts: [],

  add: (input) => createToast(set, input),
  success: (input) => createToast(set, input, "success"),
  error: (input) => createToast(set, input, "error"),
  warning: (input) => createToast(set, input, "warning"),
  info: (input) => createToast(set, input, "info"),

  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  dismissAll: () => {
    set({ toasts: [] });
  },
}));
