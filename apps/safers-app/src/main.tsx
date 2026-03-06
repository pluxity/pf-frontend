import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { configureApi } from "@pf-dev/api";
import { useWHEPStore } from "@pf-dev/cctv";
import { AuthProvider } from "@pf-dev/services";

import "@pf-dev/fonts/pretendard";
import { App } from "./App";
import "./styles/globals.css";

const contextPath = import.meta.env.VITE_CONTEXT_PATH || "";
const apiBasePath = import.meta.env.VITE_API_BASE_PATH || contextPath;

configureApi({
  baseURL: `${apiBasePath}/api`,
});

useWHEPStore.getState().initialize();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={contextPath || "/"}>
      <AuthProvider loginPath="/login">
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
