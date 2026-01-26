import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["packages/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "**/*.stories.tsx",
        "**/*.d.ts",
        "**/index.ts",
        "**/types.ts",
        "**/types/**",
      ],
    },
    projects: [
      {
        test: {
          name: "ui",
          root: "./packages/ui",
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          environment: "jsdom",
          globals: true,
          setupFiles: ["../../vitest.setup.ts"],
        },
      },
      {
        test: {
          name: "api",
          root: "./packages/api",
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          environment: "node",
          globals: true,
        },
      },
      {
        test: {
          name: "map",
          root: "./packages/map",
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          environment: "jsdom",
          globals: true,
          setupFiles: ["../../vitest.setup.ts"],
        },
      },
      {
        test: {
          name: "three",
          root: "./packages/three",
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          environment: "jsdom",
          globals: true,
          setupFiles: ["../../vitest.setup.ts"],
        },
      },
      {
        test: {
          name: "services",
          root: "./packages/services",
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          environment: "jsdom",
          globals: true,
          setupFiles: ["../../vitest.setup.ts"],
        },
      },
      {
        test: {
          name: "cctv",
          root: "./packages/cctv",
          include: ["src/**/*.{test,spec}.{ts,tsx}"],
          environment: "jsdom",
          globals: true,
          setupFiles: ["../../vitest.setup.ts"],
        },
      },
    ],
  },
});
