import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "atoms/index": resolve(__dirname, "src/atoms/index.ts"),
        "molecules/index": resolve(__dirname, "src/molecules/index.ts"),
        "organisms/index": resolve(__dirname, "src/organisms/index.ts"),
        "templates/index": resolve(__dirname, "src/templates/index.ts"),
        "utils/index": resolve(__dirname, "src/utils/index.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@radix-ui/react-slot",
        "@radix-ui/react-label",
        "@radix-ui/react-checkbox",
        "@radix-ui/react-switch",
        "@radix-ui/react-select",
        "@radix-ui/react-dialog",
        "@radix-ui/react-popover",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-tabs",
        "@radix-ui/react-accordion",
        "@radix-ui/react-avatar",
        "@radix-ui/react-progress",
        "@radix-ui/react-separator",
        "@radix-ui/react-radio-group",
        "@radix-ui/react-dropdown-menu",
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-toggle",
        "@radix-ui/react-toggle-group",
        "class-variance-authority",
        "clsx",
        "tailwind-merge",
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
});
