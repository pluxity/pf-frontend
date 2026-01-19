import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { configureApi } from "@pf-dev/api";
import { AuthProvider } from "@pf-dev/services";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import { App } from "./App";
import "./styles/globals.css";

ModuleRegistry.registerModules([AllCommunityModule]);

const contextPath = import.meta.env.VITE_CONTEXT_PATH || "";
const apiBasePath = import.meta.env.VITE_API_BASE_PATH || contextPath;

configureApi({
  baseURL: `${apiBasePath}/api`,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={contextPath || "/"}>
      <AuthProvider loginPath="/login">
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
