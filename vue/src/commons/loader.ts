/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import axios, { AxiosRequestConfig, Method } from "axios";

import User from "jc-shared/user/user";
import Kalender from "jc-shared/programmheft/kalender";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import Message from "jc-shared/mail/message";
import { Mailingliste } from "jc-shared/user/users";
import MailRule from "jc-shared/mail/mailRule";
import Termin from "jc-shared/optionen/termin";
import FerienIcals from "jc-shared/optionen/ferienIcals";
import Accessrights from "jc-shared/user/accessrights";
import { StaffType } from "jc-shared/veranstaltung/staff";
import Veranstaltung, { ImageOverviewRow } from "jc-shared/veranstaltung/veranstaltung";
import { feedbackMessages } from "@/views/general/FeedbackMessages";
import router from "../router";
import jwt from "jsonwebtoken";

let refreshTokenState: string;

export const globals = {
  jwtToken: "",

  isAuthenticated: function isAuthenticated(callback: (isAuth: boolean) => void): void {
    if (globals.jwtToken) {
      const decoded = jwt.decode(globals.jwtToken) as { [key: string]: any };
      const exp: number = decoded.exp;
      const stillValid = Date.now() + 60000 < exp * 1000; // should be valid one more minute
      if (stillValid) {
        return callback(true);
      }
    }
    if (refreshTokenState !== "START") {
      refreshTokenState = "START";
      standardFetch(
        {
          method: "POST",
          url: "/refreshToken",
          contentType: "json",
        },
        (err: any, json: any) => {
          if (json) {
            globals.jwtToken = json.token;
            refreshTokenState = "FINISHED";
            callback(!err && json.token);
          }
        }
      );
    } else {
      callback(false);
    }
  },
};

type ContentType = "json" | "pdf" | "zip" | "other";

type FetchParams = {
  url: string;
  contentType: ContentType;
  method: Method;
  data?: any;
  title?: string;
  text?: string;
};

function standardFetch(params: FetchParams, callback: Function): void {
  const options: AxiosRequestConfig = {
    url: params.url,
    method: params.method,
    data: params.data,
    responseType: params.contentType !== "json" ? "blob" : "json",
    headers: { Authorization: `Bearer ${globals.jwtToken}` },
  };

  axios(options)
    .then((res) => {
      if (params.title || params.text) {
        feedbackMessages.addSuccess(params.title || "Erfolgreich", params.text || "---");
      }
      callback(null, res.data);
    })
    .catch((err) => {
      if (err.response.status === 401) {
        if (router.currentRoute.path !== "/login") {
          globals.isAuthenticated((isAuth: boolean) => {
            if (!isAuth) {
              router.push("/login");
              callback();
            }
          });
        }
      }

      if (err.response.text) {
        feedbackMessages.addError(`Fehler: ${err.response.status} ${err.response.statusText}`, err.response.text);
        return callback(err.response.statusText);
      }
      callback(err);
    });
}

function getForType(contentType: ContentType, url: string, callback: Function) {
  standardFetch({ contentType, url, method: "GET" }, callback);
}

export function uploadFile(data: FormData, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/upload",
      data,
      title: "Gespeichert",
      text: "Datei gespeichert",
      contentType: "other",
    },
    callback
  );
}

export function uploadBeleg(data: FormData, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/beleg",
      data,
      title: "Erfolgreich",
      text: "Beleg übertragen",
      contentType: "other",
    },
    callback
  );
}

export function logout(callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/logout",
      contentType: "json",
    },
    (err?: Error) => {
      globals.jwtToken = "";
      callback(err);
    }
  );
}

export function login(name: string, pass: string, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/login",
      data: { name, pass },
      contentType: "json",
    },
    (err: any, json: any) => {
      if (json) {
        globals.jwtToken = json.token;
      }
      callback(err, json);
    }
  );
}

function veranstaltungenCallback(callback: Function) {
  return (err?: Error, result?: object[]) => {
    callback(result?.map((r) => new Veranstaltung(r)) || []);
  };
}

export function veranstaltungenBetween(start: DatumUhrzeit, end: DatumUhrzeit, callback: Function): void {
  getForType("json", `/rest/veranstaltungen/${start.yyyyMM}/${end.yyyyMM}`, veranstaltungenCallback(callback));
}

export function veranstaltungenForTeam(selector: "zukuenftige" | "vergangene" | "alle", callback: Function): void {
  getForType("json", `/rest/veranstaltungen/${selector}`, veranstaltungenCallback(callback));
}

export function veranstaltungForUrl(url: string, callback: Function): void {
  getForType("json", `/rest/veranstaltungen/${encodeURIComponent(url)}`, (err?: Error, result?: any) =>
    callback(new Veranstaltung(result))
  );
}

export function saveVeranstaltung(veranstaltung: Veranstaltung, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/veranstaltungen",
      data: veranstaltung.toJSON(),
      title: "Gespeichert",
      text: "Veranstaltung gespeichert",
      contentType: "json",
    },
    callback
  );
}

export function deleteVeranstaltungWithId(id: string, callback: Function): void {
  standardFetch(
    {
      method: "DELETE",
      url: "/rest/veranstaltungen",
      data: { id },
      title: "Gelöscht",
      text: "Veranstaltung gelöscht",
      contentType: "json",
    },
    callback
  );
}

export function addUserToSection(veranstaltung: Veranstaltung, section: StaffType, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: `/rest/${veranstaltung.fullyQualifiedUrl}/addUserToSection`,
      data: { section },
      contentType: "json",
    },
    callback
  );
}

export function removeUserFromSection(veranstaltung: Veranstaltung, section: StaffType, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: `/rest/${veranstaltung.fullyQualifiedUrl}/removeUserFromSection`,
      data: { section },
      contentType: "json",
    },
    callback
  );
}

// User
export function currentUser(callback: Function): void {
  getForType("json", "/rest/users/current", (err?: Error, result?: object) => {
    if (err) {
      return callback(new User("invalidUser"));
    }
    const user = new User(result);
    user.accessrights = new Accessrights(user);
    callback(user);
  });
}

export function allUsers(callback: Function): void {
  getForType("json", "/rest/users", (err?: Error, result?: { users: object[] }) => {
    callback(result?.users.map((r) => new User(r)) || []);
  });
}

export function saveUser(user: User, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/user",
      data: user.toJSON(),
      title: "Gespeichert",
      text: "Änderungen gespeichert",
      contentType: "json",
    },
    callback
  );
}

export function deleteUser(user: User, callback: Function): void {
  standardFetch(
    {
      method: "DELETE",
      url: "/rest/user",
      data: user.toJSON(),
      title: "Gelöscht",
      text: "User gelöscht",
      contentType: "json",
    },
    callback
  );
}

export function saveNewUser(user: User, callback: Function): void {
  standardFetch(
    {
      method: "PUT",
      url: "/rest/user",
      data: user.toJSON(),
      title: "Gespeichert",
      text: "Neuer User angelegt",
      contentType: "json",
    },
    callback
  );
}

export function changePassword(user: User, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/user/changePassword",
      data: user.toJSON(),
      title: "Gespeichert",
      text: "Passwort geändert",
      contentType: "json",
    },
    callback
  );
}

// Programmheft
export function kalenderFor(jahrMonat: string, callback: Function): void {
  getForType("json", `/rest/programmheft/${jahrMonat}`, (err?: Error, result?: { id: string; text: string }) => {
    callback(new Kalender(result));
  });
}

export function saveProgrammheft(kalender: Kalender, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/programmheft",
      data: kalender,
      title: "Gespeichert",
      text: "Änderungen gespeichert",
      contentType: "json",
    },
    callback
  );
}

// Optionen & Termine
export function optionen(callback: Function): void {
  getForType("json", "/rest/optionen", (err?: Error, result?: any) => callback(new OptionValues(result)));
}

export function saveOptionen(optionen: OptionValues, callback: Function): void {
  if (optionen.agenturen.length === 0 || optionen.hotels.length === 0 || optionen.kooperationen.length === 0) {
    return callback(new Error("oops, Optionen kaputt??"));
  }
  standardFetch(
    {
      method: "POST",
      url: "/rest/optionen",
      data: optionen.toJSON(),
      title: "Gespeichert",
      text: "Optionen gespeichert",
      contentType: "json",
    },
    callback
  );
}

export function saveOptionenQuiet(optionen: OptionValues, callback: Function): void {
  if (optionen.agenturen.length === 0 || optionen.hotels.length === 0 || optionen.kooperationen.length === 0) {
    return callback(new Error("oops, Optionen kaputt??"));
  }
  standardFetch(
    {
      method: "POST",
      url: "/rest/optionen",
      data: optionen.toJSON(),
      contentType: "json",
    },
    callback
  );
}

export function orte(callback: Function): void {
  getForType("json", "/rest/orte", (err?: Error, result?: any) => callback(new Orte(result)));
}

export function saveOrte(orte: Orte, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/orte",
      data: orte.toJSON(),
      title: "Gespeichert",
      text: "Orte aktualisiert",
      contentType: "json",
    },
    callback
  );
}

export function termine(callback: Function): void {
  getForType("json", "/rest/termine", (err?: Error, result?: any) => callback(result?.map((r: any) => new Termin(r))) || []);
}

export function saveTermin(termin: Termin, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/termin",
      data: termin,
      title: "Gespeichert",
      text: "Termin gespeichert",
      contentType: "json",
    },
    callback
  );
}

export function deleteTermin(terminID: string, callback: Function): void {
  standardFetch(
    {
      method: "DELETE",
      url: "/rest/termin",
      data: { id: terminID },
      title: "Gelöscht",
      text: "Termin gelöscht",
      contentType: "json",
    },
    callback
  );
}

export function kalender(callback: Function): void {
  getForType("json", "/rest/kalender", (err?: Error, result?: any) => callback(new FerienIcals(result)));
}

export function saveKalender(kalender: FerienIcals, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/kalender",
      data: kalender,
      title: "Gespeichert",
      text: "Änderungen gespeichert",
      contentType: "json",
    },
    callback
  );
}

// Image
export function imagenames(callback: Function): void {
  getForType("json", "/rest/imagenames", (err?: Error, result?: { names: string[] }) => callback(result?.names));
}

export function saveImagenames(rows: ImageOverviewRow[], callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/imagenames",
      data: rows,
      title: "Gespeichert",
      text: "Änderungen gespeichert",
      contentType: "json",
    },
    callback
  );
}

//Mails intern
export function sendMail(message: Message, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/rundmail",
      data: message,
      title: "Gesendet",
      text: "Meil geschickt",
      contentType: "json",
    },
    callback
  );
}

export function deleteMailinglist(listname: string, callback: Function): void {
  standardFetch(
    {
      method: "DELETE",
      url: "/rest/mailingliste",
      data: { name: listname },
      title: "Gelöscht",
      text: "Liste gelöscht",
      contentType: "json",
    },
    callback
  );
}

export function saveMailinglist(list: Mailingliste, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/mailingliste",
      data: list,
      title: "Gespeichert",
      text: "Liste gespeichert",
      contentType: "json",
    },
    callback
  );
}

// Mails für Veranstaltungen
export function mailRules(callback: Function): void {
  getForType("json", "/rest/mailrule", (err?: Error, result?: any[]) => callback(result?.map((each) => new MailRule(each))) || []);
}

export function deleteMailRule(ruleID: string, callback: Function): void {
  standardFetch(
    {
      method: "DELETE",
      url: "/rest/mailrule",
      data: { id: ruleID },
      title: "Gelöscht",
      text: "Regel gelöscht",
      contentType: "json",
    },
    callback
  );
}

export function saveMailRule(rule: MailRule, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/mailrule",
      data: rule,
      title: "Gespeichert",
      text: "Regel gespeichert",
      contentType: "json",
    },
    callback
  );
}

// Wiki
export function wikisubdirs(callback: Function): void {
  getForType("json", "/rest/wikidirs", (err?: Error, json?: object) => callback(json || []));
}
export function wikiPage(subdir: string, page: string, callback: Function): void {
  getForType("json", `/rest/wikipage/${subdir}/${page}`, (err?: Error, result?: any) => callback(result.content || ""));
}

export function saveWikiPage(subdir: string, page: string, content: string, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: `/rest/wikipage/${subdir}/${page}`,
      data: { content },
      title: "Gespeichert",
      text: "Die Seite wurde gespeichert.",
      contentType: "json",
    },
    callback
  );
}

export function searchWiki(suchtext: string, callback: Function): void {
  standardFetch(
    {
      method: "POST",
      url: "/rest/wikipage/search",
      data: { suchtext },
      contentType: "json",
    },
    callback
  );
}

export function deleteWikiPage(subdir: string, page: string, callback: Function): void {
  standardFetch(
    {
      method: "DELETE",
      url: `/rest/wikipage/${subdir}/${page}`,
      data: { data: "" },
      contentType: "json",
    },
    callback
  );
}

// Calendar
export function calendarEventSources(start: Date, end: Date, callback: Function): void {
  getForType("json", `/rest/fullcalendarevents.json?start=${start.toISOString()}&end=${end.toISOString()}`, callback);
}

// Special
export function openKassenzettel(veranstaltung: Veranstaltung) {
  getForType("pdf", `/pdf/kassenzettel/${veranstaltung.url}`, (err: Error | null, pdf: any) => {
    if (!err && pdf) {
      showFile(pdf);
    }
  });
}

export function openVertrag(veranstaltung: Veranstaltung) {
  getForType("pdf", `/pdf/vertrag/${veranstaltung.url}/${veranstaltung.vertrag.sprache.toLowerCase()}`, (err: Error | null, pdf: any) => {
    if (!err && pdf) {
      showFile(pdf);
    }
  });
}

export function imgZip(yymm: string) {
  getForType("zip", `/imgzip/${yymm}`, (err: Error | null, pdf: any) => {
    if (!err && pdf) {
      showFile(pdf, `JazzClub_Bilder_${DatumUhrzeit.forYYMM(yymm).fuerKalenderViews}.zip`);
    }
  });
}

function showFile(blob: Blob, downloadAsFilename?: string) {
  const objectURL = window.URL.createObjectURL(blob);

  if (downloadAsFilename) {
    const link = document.createElement("a");
    link.href = objectURL;
    link.target = "_blank";
    link.download = downloadAsFilename;
    link.click();
  } else {
    window.open(objectURL);
  }
  /*
   */
  setTimeout(function () {
    // For Firefox it is necessary to delay revoking the ObjectURL
    window.URL.revokeObjectURL(objectURL);
  }, 100);
}
