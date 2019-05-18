module.exports = function handle500(logger) {
  /* eslint no-unused-vars: 0 */
  return (error, req, res, next) => {
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
};
