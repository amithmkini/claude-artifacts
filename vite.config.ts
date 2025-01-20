import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    mkcert(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "script",
      includeAssets: [
        "artifacts.png",
        "claude-artifacts-wide.png",
        "claude-artifacts-narrow.png",
      ],
      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: "Claude Artifacts",
        short_name: "Claude Artifacts",
        description: "Claude Artifacts",
        theme_color: "#ffffff",
        screenshots: [
          {
            src: "claude-artifacts-wide.png",
            sizes: "1837x970",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "claude-artifacts-narrow.png",
            sizes: "404x877",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: true,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/"
});
