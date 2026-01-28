import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { configureApi } from "@pf-dev/api";
import { useWHEPStore } from "@pf-dev/cctv";

import { App } from "./App";
import "./styles/globals.css";

const contextPath = import.meta.env.VITE_CONTEXT_PATH || "";

configureApi({
  baseURL: "/api",
});

// WHEP 초기화
useWHEPStore.getState().initialize();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={contextPath || "/"}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
