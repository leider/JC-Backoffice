import express, { Request, Response, NextFunction } from "express";
import compress from "compression";
import bodyparser from "body-parser";
import loggers from "./initWinston";

import cookieParser from "cookie-parser";
import favicon from "serve-favicon";

import restApp from "./rest";

import siteApp from "./lib/site";
import history from "connect-history-api-fallback";

import expressViewHelper from "./lib/middleware/expressViewHelper";
import passportInitializer from "./lib/middleware/passportInitializer";
import accessrights from "./lib/middleware/accessrights";
import path from "path";
import { Logger } from "winston";
import passport from "passport";

const httpLogger = loggers.get("http");

// stream the log messages of express to winston, remove line breaks on message
const winstonStream = {
  write: (message: string): Logger => httpLogger.info(message.replace(/(\r\n|\n|\r)/gm, "")),
};

function secureAgainstClickjacking(req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Frame-Options", "DENY");
  next();
}

function handle404(req: Request, res: Response): void {
  httpLogger.warn("404 by requesting URL: " + req.originalUrl);
  res.redirect("/");
}

export default function (app: express.Express) {
  app.use(favicon(path.join(__dirname, "static/", "img/favicon.ico")));
  app.use(cookieParser());
  app.use(bodyparser.urlencoded({ extended: true }));
  app.use(bodyparser.json());
  app.use(compress());
  app.use("/vue", history({ index: "/index.html" }));
  app.use(express.static(path.join(__dirname, "static"), { maxAge: 10 * 60 * 60 * 1000 })); // ten hours

  app.use(passportInitializer);
  app.use(expressViewHelper);
  app.use(accessrights);
  app.use(secureAgainstClickjacking);
  app.use("/", siteApp);

  const authenticator = passport.authenticate("jwt", { session: false });
  app.use("/rest/", authenticator, accessrights, restApp);
  //app.use(handle404);
}
