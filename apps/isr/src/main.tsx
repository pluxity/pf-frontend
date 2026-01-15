import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { configureApi } from "@pf-dev/api";

import { App } from "./App";
import "./styles/globals.css";

const contextPath = import.meta.env.VITE_CONTEXT_PATH || "";
const apiBasePath = import.meta.env.VITE_API_BASE_PATH || contextPath;

configureApi({
  baseURL: `${apiBasePath}/api`,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={contextPath || "/"}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
