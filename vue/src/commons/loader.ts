/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import fetch, { Response } from "cross-fetch";
import User from "../../../shared/user/user";
import Kalender from "../../../shared/programmheft/kalender";
import DatumUhrzeit from "../../../shared/commons/DatumUhrzeit";
import OptionValues from "../../../shared/optionen/optionValues";
import Orte from "../../../shared/optionen/orte";
import Message from "../../../shared/mail/message";
import { Mailingliste } from "../../../shared/user/users";
import MailRule from "../../../shared/mail/mailRule";
import Termin from "../../../shared/optionen/termin";
import FerienIcals from "../../../shared/optionen/ferienIcals";
import Accessrights from "../../../shared/user/accessrights";
import { StaffType } from "../../../shared/veranstaltung/staff";
import Veranstaltung, { ImageOverviewRow } from "../../../shared/veranstaltung/veranstaltung";
import { feedbackMessages } from "@/views/general/FeedbackMessages";
import router from "../router";
import jwt from "jsonwebtoken";
import { Payload } from "../../../shared/commons/misc";

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
      postAndReceive("/refreshToken", undefined, (err: any, json: any) => {
        if (json) {
          globals.jwtToken = json.token;
        }
        refreshTokenState = "FINISHED";
        callback(!err && json.token);
      });
    }
  },
};

function standardFetch(url: string, callback: any, title?: string, text?: string, postHeader?: RequestInit): void {
  function handleErrorIfAny(response: Response): any {
    if (!response.ok) {
      if (response.status === 401) {
        if (router.currentRoute.path !== "/login") {
          globals.isAuthenticated((isAuth: boolean) => {
            if (!isAuth) {
              router.push("/login");
            }
          });
        }
        return;
      }
      if (response.status === 404) {
        return;
      }
      response.text().then((fehlertext) => {
        feedbackMessages.addError(`Fehler: ${response.status} ${response.statusText}`, fehlertext);
      });
      throw Error(response.statusText);
    }
    return response.json();
  }

  fetch(url, postHeader)
    .then(handleErrorIfAny)
    .then((json: any) => {
      if (title || text) {
        feedbackMessages.addSuccess(title || "Erfolgreich", text || "---");
      }
      callback(null, json);
    })
    .catch((err) => callback(err));
}

function getJson(url: string, callback: any): void {
  standardFetch(url, callback, undefined, undefined, {
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + globals.jwtToken },
  });
}

function methodAndReceive(method: string, url: string, data: any, callback: any, title?: string, text?: string): void {
  const postHeader: RequestInit = {
    method: method,
    mode: "same-origin",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrer: "no-referrer",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + globals.jwtToken },
    body: JSON.stringify(data),
  };
  standardFetch(url, callback, title, text, postHeader);
}

function deleteAndReceive(url: string, data: any, callback: any, title?: string, text?: string): void {
  methodAndReceive("DELETE", url, data, callback, title, text);
}

function putAndReceive(url: string, data: any, callback: any, title?: string, text?: string): void {
  methodAndReceive("PUT", url, data, callback, title, text);
}

function postAndReceive(url: string, data: any, callback: any, title?: string, text?: string): void {
  methodAndReceive("POST", url, data, callback, title, text);
}

function postAndReceiveForFiles(url: string, data: FormData, callback: any, title: string, text: string): void {
  const postHeader: RequestInit = {
    method: "POST",
    mode: "same-origin",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrer: "no-referrer",
    headers: { Authorization: "Bearer " + globals.jwtToken },
    body: data,
  };
  standardFetch(url, callback, title, text, postHeader);
}

export function uploadFile(data: FormData, callback: Function): void {
  postAndReceiveForFiles("/rest/upload", data, callback, "Gespeichert", "Datei gespeichert");
}

export function logout(callback: Function): void {
  postAndReceive("/rest/logout", undefined, (err?: Error) => {
    globals.jwtToken = "";
    callback(err);
  });
}

export function login(name: string, pass: string, callback: Function): void {
  postAndReceive("/login", { name, pass }, (err: any, json: any) => {
    if (json) {
      globals.jwtToken = json.token;
    }
    callback(err, json);
  });
}

function veranstaltungenCallback(callback: Function) {
  return (err?: Error, result?: object[]) => {
    callback(result?.map((r) => new Veranstaltung(r)) || []);
  };
}

export function veranstaltungenBetween(start: DatumUhrzeit, end: DatumUhrzeit, callback: Function): void {
  getJson(`/rest/veranstaltungen/${start.yyyyMM}/${end.yyyyMM}`, veranstaltungenCallback(callback));
}

export function veranstaltungenForTeam(selector: "zukuenftige" | "vergangene" | "alle", callback: Function): void {
  getJson(`/rest/veranstaltungen/${selector}`, veranstaltungenCallback(callback));
}

export function veranstaltungForUrl(url: string, callback: Function): void {
  getJson(`/rest/veranstaltungen/${encodeURIComponent(url)}`, (err?: Error, result?: any) => callback(new Veranstaltung(result)));
}

export function saveVeranstaltung(veranstaltung: Veranstaltung, callback: Function): void {
  postAndReceive("/rest/veranstaltungen", veranstaltung.toJSON(), callback, "Gespeichert", "Veranstaltung gespeichert");
}

export function deleteVeranstaltungWithId(id: string, callback: Function): void {
  deleteAndReceive("/rest/veranstaltungen", { id }, callback, "Gelöscht", "Veranstaltung gelöscht");
}

export function addUserToSection(veranstaltung: Veranstaltung, section: StaffType, callback: Function): void {
  postAndReceive(`/rest/${veranstaltung.fullyQualifiedUrl()}/addUserToSection`, { section }, callback);
}

export function removeUserFromSection(veranstaltung: Veranstaltung, section: StaffType, callback: Function): void {
  postAndReceive(`/rest/${veranstaltung.fullyQualifiedUrl()}/removeUserFromSection`, { section }, callback);
}

// User
export function currentUser(callback: Function): void {
  getJson("/rest/users/current", (err?: Error, result?: object) => {
    if (err) {
      return callback(new User("invalidUser"));
    }
    const user = new User(result);
    user.accessrights = new Accessrights(user);
    callback(user);
  });
}

export function allUsers(callback: Function): void {
  getJson("/rest/users", (err?: Error, result?: { users: object[] }) => {
    callback(result?.users.map((r) => new User(r)) || []);
  });
}

export function saveUser(user: User, callback: Function): void {
  postAndReceive("/rest/user", user.toJSON(), callback, "Gespeichert", "Änderungen gespeichert");
}

export function deleteUser(user: User, callback: Function): void {
  deleteAndReceive("/rest/user", user.toJSON(), callback, "Gelöscht", "User gelöscht");
}

export function saveNewUser(user: User, callback: Function): void {
  putAndReceive("/rest/user", user.toJSON(), callback, "Gespeichert", "Neuer User angelegt");
}

export function changePassword(user: User, callback: Function): void {
  postAndReceive("/rest/user/changePassword", user.toJSON(), callback, "Gespeichert", "Passwort geändert");
}

// Programmheft
export function kalenderFor(jahrMonat: string, callback: Function): void {
  getJson(`/rest/programmheft/${jahrMonat}`, (err?: Error, result?: { id: string; text: string }) => {
    callback(new Kalender(result));
  });
}

export function saveProgrammheft(kalender: Kalender, callback: Function): void {
  postAndReceive("/rest/programmheft", kalender, callback, "Gespeichert", "Änderungen gespeichert");
}

// Optionen & Termine
export function optionen(callback: Function): void {
  getJson("/rest/optionen", (err?: Error, result?: any) => callback(new OptionValues(result)));
}

export function saveOptionen(optionen: OptionValues, callback: Function): void {
  postAndReceive("/rest/optionen", optionen.toJSON(), callback, "Gespeichert", "Optionen gespeichert");
}

export function saveOptionenQuiet(optionen: OptionValues, callback: Function): void {
  postAndReceive("/rest/optionen", optionen.toJSON(), callback);
}

export function orte(callback: Function): void {
  getJson("/rest/orte", (err?: Error, result?: any) => callback(new Orte(result)));
}

export function saveOrte(orte: Orte, callback: Function): void {
  postAndReceive("/rest/orte", orte.toJSON(), callback, "Gespeichert", "Orte aktualisiert");
}

export function termine(callback: Function): void {
  getJson("/rest/termine", (err?: Error, result?: any) => callback(result?.map((r: any) => new Termin(r))) || []);
}

export function saveTermin(termin: Termin, callback: Function): void {
  postAndReceive("/rest/termin", termin, callback, "Gespeichert", "Termin gespeichert");
}

export function deleteTermin(terminID: string, callback: Function): void {
  deleteAndReceive("/rest/termin", { id: terminID }, callback, "Gelöscht", "Termin gelöscht");
}

export function kalender(callback: Function): void {
  getJson("/rest/kalender", (err?: Error, result?: any) => callback(new FerienIcals(result)));
}

export function saveKalender(kalender: FerienIcals, callback: Function): void {
  postAndReceive("/rest/kalender", kalender, callback, "Gespeichert", "Änderungen gespeichert");
}

// Image
export function imagenames(callback: Function): void {
  getJson("/rest/imagenames", (err?: Error, result?: { names: string[] }) => callback(result?.names));
}

export function saveImagenames(rows: ImageOverviewRow[], callback: Function): void {
  postAndReceive("/rest/imagenames", rows, callback, "Gespeichert", "Änderungen gespeichert");
}

//Mails intern
export function sendMail(message: Message, callback: Function): void {
  postAndReceive("/rest/rundmail", message, callback, "Gesendet", "Meil geschickt");
}

export function deleteMailinglist(listname: string, callback: Function): void {
  deleteAndReceive("/rest/mailingliste", { name: listname }, callback, "Gelöscht", "Liste gelöscht");
}

export function saveMailinglist(list: Mailingliste, callback: Function): void {
  postAndReceive("/rest/mailingliste", list, callback, "Gespeichert", "Liste gespeichert");
}

// Mails für Veranstaltungen
export function mailRules(callback: Function): void {
  getJson("/rest/mailrule", (err?: Error, result?: any[]) => callback(result?.map((each) => new MailRule(each))) || []);
}

export function deleteMailRule(ruleID: string, callback: Function): void {
  deleteAndReceive("/rest/mailrule", { id: ruleID }, callback, "Gelöscht", "Regel gelöscht");
}

export function saveMailRule(rule: MailRule, callback: Function): void {
  postAndReceive("/rest/mailrule", rule, callback, "Gespeichert", "Regel gespeichert");
}

// Wiki
export function wikisubdirs(callback: Function): void {
  getJson("/rest/wikidirs", (err?: Error, json?: object) => callback(json || []));
}
export function wikiPage(subdir: string, page: string, callback: Function): void {
  getJson(`/rest/wikipage/${subdir}/${page}`, (err?: Error, result?: any) => callback(result.content || ""));
}

export function saveWikiPage(subdir: string, page: string, content: string, callback: Function): void {
  postAndReceive(`/rest/wikipage/${subdir}/${page}`, { content }, callback, "Gespeichert", "Die Seite wurde gespeichert.");
}

export function searchWiki(suchtext: string, callback: Function): void {
  postAndReceive("/rest/wikipage/search", { suchtext }, callback);
}

export function deleteWikiPage(subdir: string, page: string, callback: Function): void {
  deleteAndReceive(`/rest/wikipage/${subdir}/${page}`, { data: "" }, callback);
}

// Calendar
export function calendarEventSources(start: Date, end: Date, callback: Function): void {
  getJson(`/rest/fullcalendarevents.json?start=${start.toISOString()}&end=${end.toISOString()}`, callback);
}

// Special
export function openPayload(payload: Payload): void {
  postAndReceive("/rest/onetimeToken", payload, (err?: Error, result?: { token: string }) => {
    if (err || !result) {
      return;
    }
    window.open(`/onetimeToken/${result.token}`);
  });
}
