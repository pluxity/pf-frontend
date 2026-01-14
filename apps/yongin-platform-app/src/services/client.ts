import { createApiClient } from "@pf-dev/api";

export const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_URL,
});
