import { createApiClient } from "@pf-dev/api";
import { useAuthStore } from "@/stores";

export const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_URL,
  refreshTokenURL: "/auth/refresh-token",
  onUnauthorized: () => {
    useAuthStore.getState().clearUser();
    window.location.href = "/login";
  },
});
