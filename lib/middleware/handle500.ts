import express from 'express';
import { Logger } from 'winston';

export default function handle500(logger: Logger) {
  /* eslint no-unused-vars: 0 */
  return (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // express needs four arguments!
    logger.error(req.originalUrl);
    logger.error(error.stack || '');
    if (
      /InternalOpenIDError|BadRequestError|InternalOAuthError/.test(error.name)
    ) {
      return res.render('errorPages/authenticationError.pug', {
        error,
        status: req.statusCode
      });
    }
    res.render('errorPages/500.pug', { error, status: req.statusCode });
  };
}
