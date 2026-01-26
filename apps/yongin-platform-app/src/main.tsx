import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { configureApi } from "@pf-dev/api";

import { App } from "./App";
import "./styles/globals.css";

const contextPath = import.meta.env.VITE_CONTEXT_PATH || "";

configureApi({
  baseURL: "/api",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={contextPath || "/"}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
