const beans = require('simple-configure').get('beans');
const Git = beans.get('gitmech');

module.exports = function subdirs(req, res, next) {
  Git.lsdirs((err, gitdirs) => {
    if (err) {
      return next(err);
    }
    res.locals.wikisubdirs = gitdirs;
    next();
  });
};
