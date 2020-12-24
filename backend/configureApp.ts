import express, { Request, Response, NextFunction } from "express";
import compress from "compression";
import bodyparser from "body-parser";
import cookieParser from "cookie-parser";
import history from "connect-history-api-fallback";
import path from "path";
import passport from "passport";

import loggers from "./initWinston";
import restApp from "./rest";

import siteApp from "./lib/site";

import passportInitializer from "./lib/middleware/passportInitializer";
import accessrights from "./lib/middleware/accessrights";

const httpLogger = loggers.get("http");

function secureAgainstClickjacking(req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Frame-Options", "DENY");
  next();
}

// eslint-disable-next-line no-unused-vars
function handle404(req: Request, res: Response): void {
  httpLogger.warn("404 by requesting URL: " + req.originalUrl);
  res.redirect("/");
}

export default function (app: express.Express): void {
  app.use(cookieParser());
  app.use(bodyparser.urlencoded({ extended: true }));
  app.use(bodyparser.json());
  app.use(compress());
  app.use("/vue", history({ index: "/index.html" }));
  app.use(express.static(path.join(__dirname, "static"), { maxAge: 10 * 60 * 60 * 1000 })); // ten hours

  app.use(passportInitializer);
  app.use(accessrights);
  app.use(secureAgainstClickjacking);
  app.use("/", siteApp);

  const authenticator = passport.authenticate("jwt", { session: false });
  app.use("/rest/", authenticator, accessrights, restApp);
  //app.use(handle404);
}
