import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { VitePWA } from "vite-plugin-pwa";
import checker from "vite-plugin-checker";
import path, { resolve } from "path";
import express from "express";
import dayjs from "dayjs";
import { visualizer } from "rollup-plugin-visualizer";
// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    define: {
      __APP_VERSION__: JSON.stringify(dayjs().format("DD.MM.YY HH:mm")),
    },
    root: __dirname,
    base: "/vue/",
    resolve: {
      alias: [
        // Standard src alias
        { find: "@", replacement: path.resolve(__dirname, "src") },

        // App directory alias (your JazzclubApp.tsx location)
        { find: "@/app", replacement: path.resolve(__dirname, "app") },

        // Or if you prefer absolute paths
        { find: "@app", replacement: path.resolve(__dirname, "app") },
      ],
    },
    build: {
      outDir: "../backend/static/vue",
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 5000,
      rollupOptions: {
        preload: false,
        input: {
          main: resolve(__dirname, "index.html"),
        },
        output: {
          manualChunks: {
            // Only safe, commonly-used splits
            vendor: ["react", "react-dom", "react-router"],

            // Ant Design core (tree-shakes well)
            antd: ["antd"],

            // Editor (if used)
            mdx: ["@mdxeditor/editor"],
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      setupFiles: resolve(__dirname, "test/setup.ts"),
      server: {
        deps: {
          inline: ["antd"],
        },
      },
    },
    plugins: [
      react(),

      checker({
        // e.g. use TypeScript check
        typescript: true,
      }),

      visualizer({
        filename: "stats.html",
        gzipSize: true,
        brotliSize: true,
        template: "treemap",
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
    server: {
      hmr: {
        overlay: false,
      },
    },
  };
});
