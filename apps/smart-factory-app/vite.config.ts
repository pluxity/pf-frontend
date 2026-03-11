import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const apiServerUrl = env.VITE_API_SERVER_URL || "http://localhost:8080";
  const projectPath = env.VITE_PROJECT_PATH || "";
  const proxyTarget = `${apiServerUrl}${projectPath}`;
  const cookiePath = `${projectPath}/api`;

  const contextPath = env.VITE_CONTEXT_PATH || "";

  return {
    base: contextPath || "/",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 3010,
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            if (!projectPath) return;

            const cookiePathRegex = new RegExp(`Path=${cookiePath.replace(/\//g, "\\/")}`, "gi");

            proxy.on("proxyRes", (proxyRes) => {
              const setCookie = proxyRes.headers["set-cookie"];
              if (setCookie) {
                proxyRes.headers["set-cookie"] = setCookie.map((cookie: string) =>
                  cookie.replace(cookiePathRegex, "Path=/api").replace(/Domain=[^;]+;?/gi, "")
                );
              }
            });
          },
        },
        "/media/webrtc": {
          target: "http://14.51.233.128:8813",
          changeOrigin: true,
          secure: false,
          rewrite: (path: string) => path.replace(/^\/media\/webrtc/, ""),
        },
      },
    },
    build: {
      sourcemap: mode !== "production",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            store: ["zustand"],
            babylon: ["@babylonjs/core"],
          },
        },
      },
    },
  };
});
