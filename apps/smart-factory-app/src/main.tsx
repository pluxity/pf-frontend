import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { useWHEPStore } from "@pf-dev/cctv";

import "@pf-dev/fonts/pretendard";
import { App } from "./App";
import "./styles/globals.css";

// Initialize WHEP store before rendering (required for useWHEPStream auto-connect)
useWHEPStore.getState().initialize();

const contextPath = import.meta.env.VITE_CONTEXT_PATH || "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={contextPath || "/"}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
