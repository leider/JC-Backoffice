const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const compress = require('compression');
const csurf = require('csurf');

function secureAgainstClickjacking(req, res, next) {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
}

function serverpathRemover(req, res, next) {
  res.locals.removeServerpaths = msg => {
    // find the path that comes before node_modules or lib:
    const pathToBeRemoved = /\/[^ ]*?\/(?=(node_modules|softwerkskammer\/lib)\/)/.exec(msg);
    if (pathToBeRemoved) {
      return msg.replace(new RegExp(pathToBeRemoved[0], 'g'), '');
    }
    return msg;
  };
  next();
}

function useApp(parent, url, child) {
  function ensureRequestedUrlEndsWithSlash(req, res, next) {
    if (!(/\/$/).test(req.url)) { return res.redirect(req.url + '/'); }
    next();
  }

  if (child.get('env') !== 'production') {
    child.locals.pretty = true;
  }
  parent.get('/' + url, ensureRequestedUrlEndsWithSlash);
  parent.use('/' + url + '/', child);
  return child;
}

const conf = require('simple-configure');
const beans = conf.get('beans');

// initialize winston and two concrete loggers
/*eslint no-sync: 0 */
const winston = require('winston-config').fromFileSync(path.join(__dirname, '../config/winston-config.json'));

const appLogger = winston.loggers.get('application');
const httpLogger = winston.loggers.get('http');

// stream the log messages of express to winston, remove line breaks on message
const winstonStream = {
  write: message => httpLogger.info(message.replace(/(\r\n|\n|\r)/gm, ''))
};

module.exports = {
  create: function create() {
    const app = express();
    app.use(serverpathRemover);
    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, 'views'));
    app.use(favicon(path.join(__dirname, 'public/img/favicon.ico')));
    app.use(morgan('combined', {stream: winstonStream}));
    app.use(cookieParser());
    app.use(bodyparser.urlencoded({extended: true}));
    app.use(compress());
    app.use(express.static(path.join(__dirname, 'public'), {maxAge: 600 * 1000})); // ten minutes

    app.use(beans.get('expressSessionConfigurator'));
    app.use(secureAgainstClickjacking);
    app.use(csurf());
    app.use(beans.get('addCsrfTokenToLocals'));

    app.use('/', beans.get('siteApp'));
    useApp(app, 'veranstaltungen', beans.get('veranstaltungenApp'));

    app.use(beans.get('handle404')());
    app.use(beans.get('handle500')(appLogger));

    return app;
  },

  start: function start(done) {
    const port = conf.get('port');
    const app = this.create();

    this.server = http.createServer(app);
    this.server.listen(port, () => {
      appLogger.info('Server running at port ' + port + ' in ' + process.env.NODE_ENV + ' MODE');
      if (done) { done(); }
    });
  },

  stop: function stop(done) {
    this.server.close(() => {
      appLogger.info('Server stopped');
      if (done) { done(); }
    });
  }
};
