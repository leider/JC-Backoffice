import { defineConfig, splitVendorChunkPlugin } from "vite";
import vue from "@vitejs/plugin-vue2";
import react from "@vitejs/plugin-react";

import path, { resolve } from "path";
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
          nested: resolve(__dirname, "nested/index.html"),
        },
      },
    },
    plugins: [
      react(),
      vue(),
      splitVendorChunkPlugin(),
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
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
    },
  };
});
