import loggers from './initWinston';

import express from 'express';
import { Server, createServer } from 'http';
import cookieParser from 'cookie-parser';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import bodyparser from 'body-parser';
import csurf from 'csurf';
import compress from 'compression';

import gemaApp from './lib/gema/index';
import icalApp from './lib/ical';
import mailsenderApp from './lib/mailsender';
import optionenApp from './lib/optionen';
import programmheftApp from './lib/programmheft';
import siteApp from './lib/site';
import teamseiteApp from './lib/teamseite';
import usersApp from './lib/users';
import veranstaltungenApp from './lib/veranstaltungen';
import vertragApp from './lib/vertrag';
import wikiApp from './lib/wiki';

import expressViewHelper from './lib/middleware/expressViewHelper';
import expressSessionConfigurator from './lib/middleware/expressSessionConfigurator';
import passportInitializer from './lib/middleware/passportInitializer';
import accessrights from './lib/middleware/accessrights';
import addCsrfTokenToLocals from './lib/middleware/addCsrfTokenToLocals';
import handle404 from './lib/middleware/handle404';
import handle500 from './lib/middleware/handle500';
import secureByLogin from './lib/middleware/secureByLogin';
import wikiSubdirs from './lib/middleware/wikiSubdirs';
import * as path from 'path';

function secureAgainstClickjacking(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
}

function serverpathRemover(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  res.locals.removeServerpaths = (msg: string) => {
    // find the path that comes before node_modules or lib:
    const pathToBeRemoved = /\/[^ ]*?\/(?=(node_modules|JC_Backoffice\/lib)\/)/.exec(
      msg
    );
    if (pathToBeRemoved) {
      return msg.replace(new RegExp(pathToBeRemoved[0], 'g'), '');
    }
    return msg;
  };
  next();
}

function useApp(parent: express.Express, url: string, child: express.Express) {
  function ensureRequestedUrlEndsWithSlash(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (!/\/$/.test(req.url)) {
      return res.redirect(req.url + '/');
    }
    next();
  }

  if (process.env.NODE_ENV !== 'production') {
    child.locals.pretty = true;
  }
  parent.get('/' + url, ensureRequestedUrlEndsWithSlash);
  parent.use('/' + url + '/', child);
  return child;
}

const conf = require('simple-configure');
const beans = conf.get('beans');

const appLogger = loggers.get('application');
const httpLogger = loggers.get('http');

// stream the log messages of express to winston, remove line breaks on message
const winstonStream = {
  write: (message: string) =>
    httpLogger.info(message.replace(/(\r\n|\n|\r)/gm, ''))
};

export default class TheApp {
  server!: Server;

  create() {
    const app = express();
    app.use(serverpathRemover);
    app.set('view engine', 'pug');
    app.set('views', path.join(__dirname, 'views'));
    app.use(favicon(path.join(__dirname, 'public/', 'img/favicon.ico')));
    app.use(morgan('combined', { stream: winstonStream }));
    app.use(cookieParser());
    app.use(bodyparser.urlencoded({ extended: true }));
    app.use(compress());
    app.use(
      express.static(path.join(__dirname, 'public'), {
        maxAge: 10 * 60 * 60 * 1000
      })
    ); // ten hours
    //app.use(express.static(path.join(__dirname, 'public'), {maxAge: 60 * 1000})); // one minute

    app.use(expressSessionConfigurator);
    app.use(passportInitializer);
    app.use(secureByLogin);
    app.use(expressViewHelper);
    app.use(accessrights);
    app.use(secureAgainstClickjacking);
    app.use(csurf());
    app.use(addCsrfTokenToLocals);
    app.use(wikiSubdirs);
    app.use('/', siteApp);
    useApp(app, 'mailsender', mailsenderApp);
    useApp(app, 'optionen', optionenApp);
    useApp(app, 'veranstaltungen', veranstaltungenApp);
    useApp(app, 'users', usersApp);
    useApp(app, 'gema', gemaApp);
    useApp(app, 'teamseite', teamseiteApp);
    useApp(app, 'wiki', wikiApp);
    useApp(app, 'ical', icalApp);
    useApp(app, 'vertrag', vertragApp);
    useApp(app, 'programmheft', programmheftApp);

    app.use(handle404(httpLogger));
    app.use(handle500(appLogger));

    return app;
  }

  start(done?: Function) {
    const port = conf.get('port');
    const app = this.create();

    this.server = createServer(app);
    this.server.listen(port, () => {
      appLogger.info(
        'Server running at port ' +
          port +
          ' in ' +
          process.env.NODE_ENV +
          ' MODE'
      );
      if (done) {
        done();
      }
    });
  }

  stop(done: Function) {
    this.server.close(() => {
      appLogger.info('Server stopped');
      if (done) {
        done();
      }
    });
  }
}
