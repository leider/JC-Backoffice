import express from 'express';

export default function addCsrfTokenToLocals(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  // eslint-disable-next-line camelcase,@typescript-eslint/camelcase
  res.locals.csrf_token = req.csrfToken();
  next();
}
