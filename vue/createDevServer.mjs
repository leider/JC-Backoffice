import express from "express";
import { createServer as createViteServer } from "vite";

import "jc-backend/configure";
import configureApp from "jc-backend/configureApp";

async function createServer() {
  const app = express();

  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom", // don't include Vite's default HTML handling middlewares
  });
  app.use(configureApp);
  // Use vite's connect instance as middleware
  app.use(vite.middlewares);
}

createServer();
