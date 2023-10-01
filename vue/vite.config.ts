import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";

import { VitePWA } from "vite-plugin-pwa";
// @ts-ignore
import path, { resolve } from "path";
// @ts-ignore
import express from "express";
// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    root: __dirname,
    base: "/vue/",
    build: {
      outDir: "../backend/static/vue",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
        },
      },
    },
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
        includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
        manifest: {
          name: "Jazzclub Backoffice",
          short_name: "BO Jazz",
          description: "Die Backoffice Anwendung des Jazzclub",
          theme_color: "#000000",
          icons: [
            {
              src: "/img/logo-square-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/img/logo-square-512.png",
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
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    },
  };
});
