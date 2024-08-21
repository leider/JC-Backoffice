import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { VitePWA } from "vite-plugin-pwa";
import path, { resolve } from "path";
import express from "express";
// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    root: __dirname,
    base: "/vue/",
    build: {
      outDir: "../backend/static/vue",
      emptyOutDir: false,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
        },
      },
    },
    test: { environment: "jsdom", setupFiles: resolve(__dirname, "test/setup.ts") },
    plugins: [
      react(),
      //splitVendorChunkPlugin(),
      {
        name: "vite-plugin-cache-control",
        async configureServer(server) {
          await import("jc-backend/configure");
          const configureApp = await import("jc-backend/configureApp");
          const app = express();
          configureApp.default(app, true);
          server.middlewares.use(app);
        },
      },
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: ["/img/favicon.ico", "/img/logo-square-180.png"],
        manifest: {
          name: "Jazzclub Backoffice",
          short_name: "BO Jazz",
          description: "Die Backoffice Anwendung des Jazzclub",
          lang: "de",
          theme_color: "#000000",
          icons: [
            {
              src: "/vue/img/logo-square-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/vue/img/logo-square-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".cjs", ".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    },
    server: {
      hmr: {
        overlay: false,
      },
    },
  };
});
