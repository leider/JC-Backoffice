import express from 'express';

export default function handle500(logger: any) {
  /* eslint no-unused-vars: 0 */
  return (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // express needs four arguments!
    const status = error.status || 500;
    res.status(status);
    logger.error(req.originalUrl);
    logger.error(error.stack);
    if (
      /InternalOpenIDError|BadRequestError|InternalOAuthError/.test(error.name)
    ) {
      return res.render('errorPages/authenticationError.pug', {
        error,
        status
      });
    }
    res.render('errorPages/500.pug', { error, status });
  };
}
