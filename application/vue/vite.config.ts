import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { VitePWA } from "vite-plugin-pwa";
import checker from "vite-plugin-checker";
import path, { resolve } from "path";
import express from "express";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    define: {
      __APP_VERSION__: JSON.stringify(new DatumUhrzeit().mitUhrzeitNumerisch),
    },
    root: __dirname,
    base: "/vue/",
    build: {
      outDir: "../backend/static/vue",
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 5000,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
        },
      },
    },
    test: { environment: "jsdom", setupFiles: resolve(__dirname, "test/setup.ts") },
    plugins: [
      react(),

      checker({
        // e.g. use TypeScript check
        typescript: true,
      }),

      //splitVendorChunkPlugin(),
      {
        name: "vite-plugin-cache-control",
        async configureServer(server) {
          await import("jc-backend/configure");
          const configureApp = await import("jc-backend/configureApp");
          const app = express();
          configureApp.default(app, true);
          server.middlewares.use(app);
          process.on("SIGINT", () => {
            process.exit(0); // eslint-disable-line no-process-exit
          });
        },
      },
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: ["/img/favicon.ico", "/img/logo-square-180.png"],
        workbox: {
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 5000000,
        },
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
