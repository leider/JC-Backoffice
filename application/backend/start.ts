import "./configure.js";

import loggers from "./initWinston.js";

import express from "express";
import { createServer } from "http";
import configureApp from "./configureApp.js";
import conf from "jc-shared/commons/simpleConfigure.js";

const app = express();
configureApp(app);
const appLogger = loggers.get("application");

process.env.TZ = "Europe/Berlin";
const server = createServer(app);

export function start() {
  server.listen(conf.port, () => {
    appLogger.info("Server running at port " + conf.port + " in " + process.env.NODE_ENV + " MODE");
  });
}
export function stop() {
  server.close();
}
process.on("SIGINT", () => {
  console.log("SHUTDOWN ON SIGINT (express)"); // eslint-disable-line no-console
  server.close();
});
