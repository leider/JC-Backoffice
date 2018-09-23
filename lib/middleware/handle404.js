module.exports = function handle404(logger) {
  return (req, res) => {
    logger.warn('404 by requesting URL: ' + req.originalUrl);
    res.status(404);
    res.render('errorPages/404.pug');
  };
};
