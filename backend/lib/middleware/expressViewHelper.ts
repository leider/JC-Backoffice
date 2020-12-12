import express from "express";
import conf from "../commons/simpleConfigure";

export default function expressViewHelper(req: express.Request, res: express.Response, next: express.NextFunction): void {
  res.locals.publicUrlPrefix = conf.get("publicUrlPrefix");
  next();
}
