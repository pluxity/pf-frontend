import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useWHEPStore } from "@pf-dev/cctv";
import App from "./App.tsx";
import "./index.css";

useWHEPStore.getState().initialize();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
