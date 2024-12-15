import express, { NextFunction, Request, Response } from "express";
import compress from "compression";
import cookieParser from "cookie-parser";
import history from "connect-history-api-fallback";
import path, { dirname } from "path";
import passport from "passport";

import "./initWinston.js";
import restApp from "./rest/index.js";
import siteApp from "./lib/site/index.js";
import apicalls from "./apikey/apicalls.js";
import ridersrest from "./lib/rider/ridersrest.js";
import passportInitializer from "./lib/middleware/passportInitializer.js";
import passportApiKeyInitializer from "./lib/middleware/passportApiKeyInitializer.js";
import { fileURLToPath } from "url";
import conf from "jc-shared/commons/simpleConfigure.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function secureAgainstClickjacking(req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Frame-Options", "DENY");
  next();
}

function handle404(req: Request, res: Response): void {
  res.redirect("/");
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function handle500(error: any, req: Request, res: Response, next: NextFunction): void {
  const status = error.status || 500;
  res.status(status);
  if (req.headers["content-type"] === "application/json") {
    res.send((error as Error)?.message);
  } else {
    res.render("500.pug", { error, status });
  }
}

export default function (app: express.Express, forDev?: boolean): void {
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "pug");
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(compress());
  if (!forDev) {
    app.use("/vue", history());
    app.use("/rider", history());
  }
  app.use(express.static(path.join(__dirname, "static"), { maxAge: 10 * 60 * 60 * 1000 })); // ten hours
  app.use(express.static(conf.additionalstatic, { maxAge: 10 * 60 * 60 * 1000 })); // ten hours

  app.use(passportInitializer);
  app.use(passportApiKeyInitializer);
  app.use(secureAgainstClickjacking);
  app.use("/", siteApp);

  const authenticatorJwt = passport.authenticate("jwt", { session: false });
  app.use("/rest/", authenticatorJwt, restApp);
  const authenticatorBearer = passport.authenticate("bearer", { session: false });
  app.use("/api/", authenticatorBearer, apicalls);
  app.use("/ridersrest/", ridersrest);
  if (!forDev) {
    app.use(handle404);
    app.use(handle500);
  }
}
