import express from "express";
import compress from "compression";
import bodyparser from "body-parser";

import loggers from "./initWinston";

import cookieParser from "cookie-parser";
import favicon from "serve-favicon";
import morgan from "morgan";
import csurf from "csurf";

import gemaApp from "./lib/gema/index";
import icalApp from "./lib/ical";
import mailsenderApp from "./lib/mailsender";
import optionenApp from "./lib/optionen";
import programmheftApp from "./lib/programmheft";
import siteApp from "./lib/site";
import teamseiteApp from "./lib/teamseite";
import usersApp from "./lib/users";
import veranstaltungenApp from "./lib/veranstaltungen";
import vertragApp from "./lib/vertrag";
import wikiApp from "./lib/wiki";
import vueApp from "./lib/vue";
import history from "connect-history-api-fallback";

import expressViewHelper from "./lib/middleware/expressViewHelper";
import expressSessionConfigurator from "./lib/middleware/expressSessionConfigurator";
import passportInitializer from "./lib/middleware/passportInitializer";
import accessrights from "./lib/middleware/accessrights";
import addCsrfTokenToLocals from "./lib/middleware/addCsrfTokenToLocals";
import secureByLogin from "./lib/middleware/secureByLogin";
import wikiSubdirs from "./lib/middleware/wikiSubdirs";
import path from "path";
import { Logger } from "winston";

const httpLogger = loggers.get("http");

// stream the log messages of express to winston, remove line breaks on message
const winstonStream = {
  write: (message: string): Logger => httpLogger.info(message.replace(/(\r\n|\n|\r)/gm, ""))
};

function secureAgainstClickjacking(req: express.Request, res: express.Response, next: express.NextFunction): void {
  res.setHeader("X-Frame-Options", "DENY");
  next();
}

function serverpathRemover(req: express.Request, res: express.Response, next: express.NextFunction): void {
  res.locals.removeServerpaths = (msg: string): string => {
    // find the path that comes before node_modules or lib:
    const pathToBeRemoved = /\/[^ ]*?\/(?=(node_modules|JC-Backoffice\/lib)\/)/.exec(msg);
    if (pathToBeRemoved) {
      return msg.replace(new RegExp(pathToBeRemoved[0], "g"), "");
    }
    return msg;
  };
  next();
}

function useApp(parent: express.Express, url: string, child: express.Express): express.Express {
  function ensureRequestedUrlEndsWithSlash(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (!/\/$/.test(req.url)) {
      res.redirect(req.url + "/");
    } else {
      next();
    }
  }

  if (process.env.NODE_ENV !== "production") {
    child.locals.pretty = true;
  }
  parent.get("/" + url, ensureRequestedUrlEndsWithSlash);
  parent.use("/" + url + "/", child);
  return child;
}

export default function(app: express.Express) {
  app.use(serverpathRemover);
  app.set("view engine", "pug");
  app.set("views", path.join(__dirname, "views"));
  app.use(favicon(path.join(__dirname, "static/", "img/favicon.ico")));
  app.use(morgan("combined", { stream: winstonStream }));
  app.use(cookieParser());
  app.use(bodyparser.urlencoded({ extended: true }));
  app.use(bodyparser.json());
  app.use(compress());
  app.use(express.static(path.join(__dirname, "static"), { maxAge: 10 * 60 * 60 * 1000 })); // ten hours

  app.use(expressSessionConfigurator);
  app.use(passportInitializer);
  app.use(secureByLogin);
  app.use(expressViewHelper);
  app.use(accessrights);
  app.use(secureAgainstClickjacking);
  app.use(csurf({ cookie: true }));
  app.use(addCsrfTokenToLocals);
  app.use(wikiSubdirs);
  app.use("/", siteApp);
  useApp(app, "mailsender", mailsenderApp);
  useApp(app, "optionen", optionenApp);
  useApp(app, "veranstaltungen", veranstaltungenApp);
  useApp(app, "users", usersApp);
  useApp(app, "gema", gemaApp);
  useApp(app, "teamseite", teamseiteApp);
  useApp(app, "wiki", wikiApp);
  useApp(app, "ical", icalApp);
  useApp(app, "vertrag", vertragApp);
  useApp(app, "programmheft", programmheftApp);
  useApp(app, "vue-spa", vueApp);

  app.use("/vue", history({ index: "/vue/index.html" }));
}
