import express from "express";

export default function addCsrfTokenToLocals(req: Express.Request, res: express.Response, next: express.NextFunction): void {
  res.locals.csrf_token = req.csrfToken();
  next();
}
