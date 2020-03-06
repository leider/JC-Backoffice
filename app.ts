import loggers from "./initWinston";

import express from "express";
import { Server, createServer } from "http";
import path from "path";
const appLogger = loggers.get("application");
import configureApp from "./configureApp";

import conf from "./lib/commons/simpleConfigure";

export default class TheApp {
  server!: Server;

  create(): express.Express {
    const app = express();
    app.use(express.static(path.join(__dirname, "public"), { maxAge: 10 * 60 * 60 * 1000 })); // ten hours
    //app.use(express.static(path.join(__dirname, 'public'), {maxAge: 60 * 1000})); // one minute
    configureApp(app);
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
