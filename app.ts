import loggers from "./initWinston";

import express from "express";
import { Server, createServer } from "http";
const appLogger = loggers.get("application");
const httpLogger = loggers.get("http");
import configureApp from "./configureApp";

import conf from "./lib/commons/simpleConfigure";
import handle404 from "./lib/middleware/handle404";
import handle500 from "./lib/middleware/handle500";

export default class TheApp {
  server!: Server;

  create(): express.Express {
    const app = express();
    configureApp(app);

    app.use(handle404(httpLogger));
    app.use(handle500(appLogger));
    return app;
  }

  start(done?: Function): void {
    const port = conf.get("port");
    const app = this.create();

    this.server = createServer(app);
    this.server.listen(port, () => {
      appLogger.info("Server running at port " + port + " in " + process.env.NODE_ENV + " MODE");
      if (done) {
        done();
      }
    });
  }

  stop(done: Function): void {
    this.server.close(() => {
      appLogger.info("Server stopped");
      if (done) {
        done();
      }
    });
  }
}
