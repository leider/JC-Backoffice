import "./configure";

import loggers from "./initWinston";

import express from "express";
import { createServer } from "http";
import configureApp from "./configureApp";

const app = express();
configureApp(app);
const appLogger = loggers.get("application");

import conf from "./lib/commons/simpleConfigure";
const port = conf.get("port");

createServer(app).listen(port, () => {
  appLogger.info("Server running at port " + port + " in " + process.env.NODE_ENV + " MODE");
});
