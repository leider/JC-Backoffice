import "./configure.js";

import loggers from "./initWinston.js";

import express from "express";
import { createServer } from "http";
import configureApp from "./configureApp.js";

const app = express();
configureApp(app);
const appLogger = loggers.get("application");

import conf from "../shared/commons/simpleConfigure.js";
const port = conf.get("port");

process.env.TZ = "Europe/Berlin";
const server = createServer(app);

export function start() {
  server.listen(port, () => {
    appLogger.info("Server running at port " + port + " in " + process.env.NODE_ENV + " MODE");
  });
}
export function stop() {
  server.close();
}
