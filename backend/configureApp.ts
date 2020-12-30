import express, { Request, Response, NextFunction } from "express";
import compress from "compression";
import bodyparser from "body-parser";
import cookieParser from "cookie-parser";
import history from "connect-history-api-fallback";
import path from "path";
import passport from "passport";

import "./initWinston";
import restApp from "./rest";
import siteApp from "./lib/site";
import passportInitializer from "./lib/middleware/passportInitializer";

function secureAgainstClickjacking(req: Request, res: Response, next: NextFunction): void {
  res.setHeader("X-Frame-Options", "DENY");
  next();
}

export default function (app: express.Express): void {
  app.use(cookieParser());
  app.use(bodyparser.urlencoded({ extended: true }));
  app.use(bodyparser.json());
  app.use(compress());
  app.use("/vue", history({ index: "/index.html" }));
  app.use(express.static(path.join(__dirname, "static"), { maxAge: 10 * 60 * 60 * 1000 })); // ten hours

  app.use(passportInitializer);
  app.use(secureAgainstClickjacking);
  app.use("/", siteApp);

  const authenticator = passport.authenticate("jwt", { session: false });
  app.use("/rest/", authenticator, restApp);
}
