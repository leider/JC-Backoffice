import express from 'express';

export default function addCsrfTokenToLocals(req: express.Request, res: express.Response, next: express.NextFunction) {
  /* eslint camelcase: 0 */
  res.locals.csrf_token = req.csrfToken();
  next();
};
