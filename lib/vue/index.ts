import { salesreportFor } from "../reservix/reservixService";

import conf from "../commons/simpleConfigure";
import express, { Request, Response } from "express";

import async from "async";
import R from "ramda";

import fieldHelpers from "../commons/fieldHelpers";

import optionenService from "../optionen/optionenService";
import store from "../veranstaltungen/veranstaltungenstore";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";
import userstore from "../users/userstore";
import DatumUhrzeit from "../commons/DatumUhrzeit";
import User from "../users/user";
import Salesreport from "../reservix/salesreport";

import FerienIcals from "../optionen/ferienIcals";
import { expressAppIn } from "../middleware/expressViewHelper";
import Git from "../wiki/gitmech";
import optionenservice from "../optionen/optionenService";
import { StaffType } from "../veranstaltungen/object/staff";

const app = expressAppIn(__dirname);

type CalendarEvent = {
  start: string;
  end: string;
  url: string;
  title: string;
  tooltip: string;
  className: string;
};

function filterUnbestaetigteFuerJedermann(veranstaltungen: Veranstaltung[], res: express.Response): Veranstaltung[] {
  if (res.locals.accessrights.isBookingTeam()) {
    return veranstaltungen;
  }
  return veranstaltungen.filter((v) => v.kopf.confirmed);
}

function veranstaltungenForDisplay(fetcher: Function, next: express.NextFunction, res: express.Response, titel: string): void {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/teamseite/");
  }

  function associateReservix(veranstaltung: Veranstaltung, callback: Function): void {
    const reservixID = veranstaltung.reservixID;
    if (reservixID && (!veranstaltung.salesreport || !veranstaltung.salesreport?.istVergangen())) {
      salesreportFor(reservixID, (salesreport?: Salesreport) => {
        veranstaltung.associateSalesreport(salesreport);
        store.saveVeranstaltung(veranstaltung, (err: Error | null) => {
          callback(err, veranstaltung);
        });
      });
    } else {
      callback(null, veranstaltung);
    }
  }

  return fetcher((err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err) {
      return next(err);
    }
    return async.parallel(
      {
        users: (callback) => userstore.allUsers(callback),
        icals: (callback) => optionenService.icals(callback),
      },
      (err1, results) => {
        if (err1) {
          return next(err1);
        }
        return async.each(veranstaltungen, associateReservix, (err2) => {
          if (err2) {
            return next(err2);
          }
          const icals = (results.icals as FerienIcals).forCalendar();
          icals.unshift("/veranstaltungen/eventsForCalendar");
          icals.unshift("/ical/eventsForCalendar");

          const filteredVeranstaltungen = filterUnbestaetigteFuerJedermann(veranstaltungen, res);
          const groupedVeranstaltungen = R.groupBy((veranst) => veranst.startDatumUhrzeit().monatLangJahrKompakt, filteredVeranstaltungen);
          return res.render("../../teamseite/views/indexAdmin", {
            titel,
            users: R.sortBy(R.prop("name"), results.users as User[]),
            icals,
            groupedVeranstaltungen,
            webcalURL: (conf.get("publicUrlPrefix") as string).replace(/https|http/, "webcal") + "/ical/",
          });
        });
      }
    );
  });
}

function eventsBetween(start: DatumUhrzeit, end: DatumUhrzeit, res: express.Response, callback: Function): void {
  function asCalendarEvent(veranstaltung: Veranstaltung): CalendarEvent {
    const urlSuffix = res.locals.accessrights.isOrgaTeam() ? "/allgemeines" : "/preview";

    return {
      start: veranstaltung.startDate.toISOString(),
      end: veranstaltung.endDate.toISOString(),
      url: veranstaltung.fullyQualifiedUrl() + urlSuffix,
      title: veranstaltung.kopf.titel,
      tooltip: veranstaltung.tooltipInfos(),
      className:
        (!veranstaltung.kopf.confirmed ? "color-geplant " : "") +
        "verySmall color-" +
        fieldHelpers.cssColorCode(veranstaltung.kopf.eventTyp),
    };
  }

  store.byDateRangeInAscendingOrder(start, end, (err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err) {
      return callback(err);
    }
    return callback(null, filterUnbestaetigteFuerJedermann(veranstaltungen, res).map(asCalendarEvent));
  });
}

app.get("/zukuenftige", (req, res, next) => veranstaltungenForDisplay(store.zukuenftigeMitGestern, next, res, "Zukünftige"));

app.get("/vergangene", (req, res, next) => veranstaltungenForDisplay(store.vergangene, next, res, "Vergangene"));

app.get("/veranstaltungen.json", (req, res) => {
  store.zukuenftigeMitGestern((err: Error, veranstaltungen: Veranstaltung[]) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(veranstaltungen.map((v) => v.toJSON()));
  });
});

app.post("/saveVeranstaltung", (req, res) => {
  const veranstaltung = new Veranstaltung(req.body);
  store.saveVeranstaltung(veranstaltung, (err: Error) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(veranstaltung.toJSON());
  });
});

function addOrRemoveUserFromSection(func: "addUserToSection" | "removeUserFromSection", req: Request, res: Response): void {
  store.getVeranstaltungForId(req.body.id, (err: Error, veranstaltung: Veranstaltung) => {
    if (err) {
      return res.status(500).send(err);
    }
    veranstaltung.staff[func](req.user as User, req.body.section);
    return store.saveVeranstaltung(veranstaltung, (err1: Error) => {
      if (err1) {
        return res.status(500).send(err1);
      }
      return res.set("Content-Type", "application/json").send(veranstaltung.toJSON());
    });
  });
}

app.post("/addUserToSection", (req, res) => {
  addOrRemoveUserFromSection("addUserToSection", req, res);
});

app.post("/removeUserFromSection", (req, res) => {
  addOrRemoveUserFromSection("removeUserFromSection", req, res);
});

app.get("/user.json", (req, res) => {
  res.set("Content-Type", "application/json").send((req.user as User)?.toJSON());
});

app.get("/allusers.json", (req, res) => {
  userstore.allUsers((err: Error | null, users: User[]) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(users.map((u) => u.toJSON()));
  });
});

app.post("/saveUser", (req, res) => {
  const user = new User(req.body);
  if (!res.locals.accessrights.canEditUser(user.id)) {
    return;
  }
  userstore.save(user, (err: Error) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(user.toJSON());
  });
});

app.get("/csrf-token.json", (req, res) => {
  res.set("Content-Type", "application/json").send({ token: req.csrfToken() });
});

app.get("/wikisubdirs.json", (req, res) => {
  Git.lsdirs((err: Error | null, gitdirs: string[]) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.set("Content-Type", "application/json").send(gitdirs);
  });
});

app.get("/icals.json", (req, res) => {
  optionenservice.icals((err: Error, icals: FerienIcals) => {
    if (err) {
      return res.status(500).send(err);
    }
    const result = icals.forCalendar();
    result.unshift("/veranstaltungen/eventsForCalendar");
    result.unshift("/ical/eventsForCalendar");
    res.set("Content-Type", "application/json").send(result);
  });
});

export default app;
