import express from 'express';
import R from 'ramda';
import async from 'async';
import misc from '../commons/misc';
import store from '../veranstaltungen/veranstaltungenstore';
import User from '../users/user';
import userstore from '../users/userstore';
import Veranstaltung from '../veranstaltungen/object/veranstaltung';
import optionenservice from '../optionen/optionenService';

const conf = require('simple-configure');

const app: express.Express = misc.expressAppIn(__dirname);

function addStaff(
  sectionOfStaff: string,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  store.getVeranstaltungForId(
    req.params.id,
    (err: Error, veranstaltung: any) => {
      if (err) {
        return next(err);
      }
      const section = veranstaltung.staff()[sectionOfStaff]();
      // @ts-ignore
      section.push(req.user.id);
      store.saveVeranstaltung(veranstaltung, (err1: Error) => {
        if (err1) {
          return next(err1);
        }
        res.redirect('/teamseite');
      });
    }
  );
}

function removeStaff(
  sectionOfStaff: string,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  store.getVeranstaltungForId(
    req.params.id,
    (err: Error, veranstaltung: any) => {
      if (err) {
        return next(err);
      }
      const section = veranstaltung.staff()[sectionOfStaff]();
      // @ts-ignore
      const index = section.indexOf(req.user.id);
      section.splice(index, 1);
      store.saveVeranstaltung(veranstaltung, (err1: Error) => {
        if (err1) {
          return next(err1);
        }
        res.redirect('/teamseite');
      });
    }
  );
}

app.get('/', (req, res, next) => {
  async.parallel(
    {
      veranstaltungen: (callback: any) => store.zukuenftigeMitGestern(callback),
      users: (callback: any) => userstore.allUsers(callback),
      icals: (callback: any) => optionenservice.icals(callback)
    },
    (err: Error | undefined, results: any) => {
      if (err) {
        return next(err);
      }
      const icals = results.icals.forCalendar();
      icals.unshift('/veranstaltungen/eventsForCalendar');
      icals.unshift('/ical/eventsForCalendar');
      const filteredVeranstaltungen = results.veranstaltungen.filter(
        (v: Veranstaltung) => v.kopf().confirmed()
      );
      const groupedVeranstaltungen = R.groupBy(
        (veranst: any) => veranst.startDatumUhrzeit().monatLangJahrKompakt,
        filteredVeranstaltungen
      );
      const users = (results.users as User[]).sort((a, b) =>
        a.name > b.name ? 1 : -1
      );
      res.render('index', {
        groupedVeranstaltungen,
        users,
        icals,
        webcalURL:
          conf.get('publicUrlPrefix').replace(/https|http/, 'webcal') + '/ical/'
      });
    }
  );
});

app.get('/addKasseV/:id', (req, res, next) => {
  addStaff('kasseV', req, res, next);
});

app.get('/addKasse/:id', (req, res, next) => {
  addStaff('kasse', req, res, next);
});

app.get('/addMoD/:id', (req, res, next) => {
  addStaff('mod', req, res, next);
});

app.get('/addTechnikerV/:id', (req, res, next) => {
  addStaff('technikerV', req, res, next);
});

app.get('/addTechniker/:id', (req, res, next) => {
  addStaff('techniker', req, res, next);
});

app.get('/addMerchandise/:id', (req, res, next) => {
  addStaff('merchandise', req, res, next);
});

app.get('/removeKasseV/:id', (req, res, next) => {
  removeStaff('kasseV', req, res, next);
});

app.get('/removeKasse/:id', (req, res, next) => {
  removeStaff('kasse', req, res, next);
});

app.get('/removeMoD/:id', (req, res, next) => {
  removeStaff('mod', req, res, next);
});

app.get('/removeTechnikerV/:id', (req, res, next) => {
  removeStaff('technikerV', req, res, next);
});

app.get('/removeTechniker/:id', (req, res, next) => {
  removeStaff('techniker', req, res, next);
});

app.get('/removeMerchandise/:id', (req, res, next) => {
  removeStaff('merchandise', req, res, next);
});

export default app;
