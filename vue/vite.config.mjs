import { defineConfig } from "vite";
// import vue from '@vitejs/plugin-vue' // vue 3
import { createVuePlugin as vue } from "vite-plugin-vue2"; //vue 2

import "jc-backend/configure";
import configureApp from "jc-backend/configureApp";
import path from "path";
import express from "express";
// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname,
  base: "/vue/",
  build: { outDir: "../backend/static/vue", emptyOutDir: true },
  plugins: [
    vue(),
    {
      name: "vite-plugin-cache-control",
      configureServer(server) {
        const app = express()
        configureApp(app, true);
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
});
