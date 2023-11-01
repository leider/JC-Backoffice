const __dirname = new URL(".", import.meta.url).pathname;
import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import compress from "compression";
import cookieParser from "cookie-parser";
import history from "connect-history-api-fallback";
import path from "path";
import passport from "passport";

import "./initWinston.js";
import restApp from "./rest/index.js";
import siteApp from "./lib/site/index.js";
import passportInitializer from "./lib/middleware/passportInitializer.js";

function secureAgainstClickjacking(req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Frame-Options", "DENY");
  next();
}

export default function (app: express.Express, forDev?: boolean): void {
  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(compress());
  if (!forDev) {
    app.use("/vue", history());
  }
  app.use(express.static(path.join(__dirname, "static"), { maxAge: 10 * 60 * 60 * 1000 })); // ten hours

  app.use(passportInitializer);
  app.use(secureAgainstClickjacking);
  app.use("/", siteApp);

  const authenticator = passport.authenticate("jwt", { session: false });
  app.use("/rest/", authenticator, restApp);
}
