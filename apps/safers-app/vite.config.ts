import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // 프록시 설정 (개발 환경 전용)
  const apiServerUrl = env.VITE_API_SERVER_URL || "http://localhost:8080";
  const projectPath = env.VITE_PROJECT_PATH || "";
  const proxyTarget = `${apiServerUrl}${projectPath}`;
  const cookiePath = `${projectPath}/api`;
  const weatherForecastUrl =
    env.VITE_API_WEATHER_FORECAST_URL ||
    "https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0";
  const weatherAlertUrl =
    env.VITE_API_WEATHER_ALERT_URL || "https://apihub.kma.go.kr/api/typ01/url";

  // Base path 설정 (staging 환경에서 contextPath 적용)
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
      port: 3000,
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
        "/weather-api/forecast": {
          target: weatherForecastUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/weather-api\/forecast/, ""),
        },
        "/weather-api/alert": {
          target: weatherAlertUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/weather-api\/alert/, ""),
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
            d3: ["d3-selection", "d3-fetch", "d3-geo", "d3-ease", "d3-transition"],
          },
        },
      },
    },
  };
});
