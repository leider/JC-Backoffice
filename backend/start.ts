import "./configure";

import loggers from "./initWinston";

import express from "express";
import { createServer } from "http";
import configureApp from "./configureApp";

import conf from "./lib/commons/simpleConfigure";
import handle404 from "./lib/middleware/handle404";
import handle500 from "./lib/middleware/handle500";

const app = express();
configureApp(app);

app.use(handle404(loggers.get("http")));

const appLogger = loggers.get("application");
app.use(handle500(appLogger));

const port = conf.get("port");
createServer(app).listen(port, () => {
  appLogger.info("Server running at port " + port + " in " + process.env.NODE_ENV + " MODE");
});
