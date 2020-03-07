import DatumUhrzeit from "../commons/DatumUhrzeit";
import statusmessage from "../commons/statusmessage";
import fieldHelpers from "../commons/fieldHelpers";
import express from "express";
import User from "../users/user";
import path from "path";
import Renderer from "../commons/renderer";
import conf from "../commons/simpleConfigure";

function gruppenUndRechteText(user: User): string {
  const tokens = user.rechte ? user.gruppen.concat(user.rechte) : user.gruppen;
  if (tokens.length > 0) {
    return tokens.map((gruppe: string) => gruppe.substring(0, 1).toLocaleUpperCase()).join(", ");
  }
  return "-";
}

export default function expressViewHelper(req: express.Request, res: express.Response, next: express.NextFunction): void {
  if (req.session) {
    if (req.session.statusmessage) {
      statusmessage.fromObject(req.session.statusmessage).putIntoSession(req, res);
    }
  }
  res.locals.user = req.user;
  res.locals.currentUrl = req.url;
  res.locals.formatReadonlyAsEuro = (number: string | number): string => {
    return fieldHelpers.formatNumberTwoDigits(number) + " €";
  };
  res.locals.formatNumberTwoDigitsEnglish = fieldHelpers.formatNumberTwoDigitsEnglish;
  res.locals.gruppenUndRechteText = gruppenUndRechteText;
  res.locals.cssColorCode = fieldHelpers.cssColorCode;
  res.locals.cssIconClass = fieldHelpers.cssIconClass;
  res.locals.DatumUhrzeit = DatumUhrzeit;
  res.locals.Renderer = Renderer;
  res.locals.publicUrlPrefix = conf.get("publicUrlPrefix");
  next();
}

export function expressAppIn(directory: string): express.Express {
  const app = express();
  app.set("views", path.join(directory, "views"));
  app.set("view engine", "pug");
  return app;
}
