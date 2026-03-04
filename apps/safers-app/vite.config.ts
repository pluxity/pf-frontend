import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

/** 현장별 WHEP 포트 목록 (cctv.service.ts의 SITE_WHEP_PORT와 동기화) */
const WHEP_PORTS = [8811, 8812, 8813, 8814, 8815, 8816, 8817, 8818, 8819];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // 프록시 설정 (개발 환경 전용)
  const apiServerUrl = env.VITE_API_SERVER_URL || "http://localhost:8080";
  const projectPath = env.VITE_PROJECT_PATH || "";
  const proxyTarget = `${apiServerUrl}${projectPath}`;
  const cookiePath = `${projectPath}/api`;
  const mediaServerUrl = env.VITE_MEDIA_SERVER_URL || "http://14.51.233.128";

  // Base path 설정 (staging 환경에서 contextPath 적용)
  const contextPath = env.VITE_CONTEXT_PATH || "";

  // /webrtc/{port} → mediaServer:{port} 프록시 엔트리 생성
  const webrtcProxy = Object.fromEntries(
    WHEP_PORTS.map((port) => [
      `/webrtc/${port}`,
      {
        target: `${mediaServerUrl}:${port}`,
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(`/webrtc/${port}`, ""),
      },
    ])
  );

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
        "/api/stomp": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            if (!projectPath) return;

            const cookiePathRegex = new RegExp(`Path=${cookiePath.replace(/\//g, "/")}`, "gi");

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
        ...webrtcProxy,
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
