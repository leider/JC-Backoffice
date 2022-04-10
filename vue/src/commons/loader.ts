/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import fetch, { Response } from "cross-fetch";
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
      callAndReceive({
        method: "POST",
        url: "/refreshToken",
        callback: (err: any, json: any) => {
          if (json) {
            globals.jwtToken = json.token;
          }
          refreshTokenState = "FINISHED";
          callback(!err && json.token);
        },
        contentType: "json",
      });
    } else {
      callback(false);
    }
  },
};

type ContentType = "json" | "pdf" | "zip" | "other";

type FetchParams = {
  url: string;
  contentType: ContentType;
  method?: string;
  data?: any;
  title?: string;
  text?: string;
  callback: any;
};

function standardFetch(params: FetchParams, postHeader?: RequestInit): void {
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
    if (params.contentType !== "json") {
      console.log("RESPONSE", response);
      return response.blob();
    }
    return response.json();
  }

  fetch(params.url, postHeader)
    .then(handleErrorIfAny)
    .then((json: any) => {
      if (params.title || params.text) {
        feedbackMessages.addSuccess(params.title || "Erfolgreich", params.text || "---");
      }
      params.callback(null, json);
    })
    .catch((err) => params.callback(err));
}

function getForType(contentType: ContentType, url: string, callback: Function) {
  standardFetch(
    { contentType, url, callback },
    { headers: { "Content-Type": `application/${contentType}`, Authorization: "Bearer " + globals.jwtToken } }
  );
}

function callAndReceive(params: FetchParams): void {
  const isJson = params.contentType === "json";
  const theHeaders: HeadersInit = { Authorization: `Bearer ${globals.jwtToken}` };
  if (isJson) {
    theHeaders["Content-Type"] = "application/json";
  }
  const postHeader: RequestInit = {
    method: params.method,
    mode: "same-origin",
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "follow",
    referrer: "no-referrer",
    headers: theHeaders,
    body: isJson ? JSON.stringify(params.data) : params.data,
  };
  standardFetch(params, postHeader);
}

export function uploadFile(data: FormData, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/rest/upload",
    data,
    title: "Gespeichert",
    text: "Datei gespeichert",
    callback,
    contentType: "other",
  });
}

export function logout(callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/rest/logout",
    callback: (err?: Error) => {
      globals.jwtToken = "";
      callback(err);
    },
    contentType: "json",
  });
}

export function login(name: string, pass: string, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/login",
    data: { name, pass },
    callback: (err: any, json: any) => {
      if (json) {
        globals.jwtToken = json.token;
      }
      callback(err, json);
    },
    contentType: "json",
  });
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
  callAndReceive({
    method: "POST",
    url: "/rest/veranstaltungen",
    data: veranstaltung.toJSON(),
    title: "Gespeichert",
    text: "Veranstaltung gespeichert",
    callback,
    contentType: "json",
  });
}

export function deleteVeranstaltungWithId(id: string, callback: Function): void {
  callAndReceive({
    method: "DELETE",
    url: "/rest/veranstaltungen",
    data: { id },
    title: "Gelöscht",
    text: "Veranstaltung gelöscht",
    callback,
    contentType: "json",
  });
}

export function addUserToSection(veranstaltung: Veranstaltung, section: StaffType, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: `/rest/${veranstaltung.fullyQualifiedUrl}/addUserToSection`,
    data: { section },
    callback,
    contentType: "json",
  });
}

export function removeUserFromSection(veranstaltung: Veranstaltung, section: StaffType, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: `/rest/${veranstaltung.fullyQualifiedUrl}/removeUserFromSection`,
    data: { section },
    callback,
    contentType: "json",
  });
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
  callAndReceive({
    method: "POST",
    url: "/rest/user",
    data: user.toJSON(),
    title: "Gespeichert",
    text: "Änderungen gespeichert",
    callback,
    contentType: "json",
  });
}

export function deleteUser(user: User, callback: Function): void {
  callAndReceive({
    method: "DELETE",
    url: "/rest/user",
    data: user.toJSON(),
    title: "Gelöscht",
    text: "User gelöscht",
    callback,
    contentType: "json",
  });
}

export function saveNewUser(user: User, callback: Function): void {
  callAndReceive({
    method: "PUT",
    url: "/rest/user",
    data: user.toJSON(),
    title: "Gespeichert",
    text: "Neuer User angelegt",
    callback,
    contentType: "json",
  });
}

export function changePassword(user: User, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/rest/user/changePassword",
    data: user.toJSON(),
    title: "Gespeichert",
    text: "Passwort geändert",
    callback,
    contentType: "json",
  });
}

// Programmheft
export function kalenderFor(jahrMonat: string, callback: Function): void {
  getForType("json", `/rest/programmheft/${jahrMonat}`, (err?: Error, result?: { id: string; text: string }) => {
    callback(new Kalender(result));
  });
}

export function saveProgrammheft(kalender: Kalender, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/rest/programmheft",
    data: kalender,
    title: "Gespeichert",
    text: "Änderungen gespeichert",
    callback,
    contentType: "json",
  });
}

// Optionen & Termine
export function optionen(callback: Function): void {
  getForType("json", "/rest/optionen", (err?: Error, result?: any) => callback(new OptionValues(result)));
}

export function saveOptionen(optionen: OptionValues, callback: Function): void {
  if (optionen.agenturen.length === 0 || optionen.hotels.length === 0 || optionen.kooperationen.length === 0) {
    return callback(new Error("oops, Optionen kaputt??"));
  }
  callAndReceive({
    method: "POST",
    url: "/rest/optionen",
    data: optionen.toJSON(),
    title: "Gespeichert",
    text: "Optionen gespeichert",
    callback,
    contentType: "json",
  });
}

export function saveOptionenQuiet(optionen: OptionValues, callback: Function): void {
  if (optionen.agenturen.length === 0 || optionen.hotels.length === 0 || optionen.kooperationen.length === 0) {
    return callback(new Error("oops, Optionen kaputt??"));
  }
  callAndReceive({
    method: "POST",
    url: "/rest/optionen",
    data: optionen.toJSON(),
    callback,
    contentType: "json",
  });
}

export function orte(callback: Function): void {
  getForType("json", "/rest/orte", (err?: Error, result?: any) => callback(new Orte(result)));
}

export function saveOrte(orte: Orte, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/rest/orte",
    data: orte.toJSON(),
    title: "Gespeichert",
    text: "Orte aktualisiert",
    callback,
    contentType: "json",
  });
}

export function termine(callback: Function): void {
  getForType("json", "/rest/termine", (err?: Error, result?: any) => callback(result?.map((r: any) => new Termin(r))) || []);
}

export function saveTermin(termin: Termin, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/rest/termin",
    data: termin,
    title: "Gespeichert",
    text: "Termin gespeichert",
    callback,
    contentType: "json",
  });
}

export function deleteTermin(terminID: string, callback: Function): void {
  callAndReceive({
    method: "DELETE",
    url: "/rest/termin",
    data: { id: terminID },
    title: "Gelöscht",
    text: "Termin gelöscht",
    callback,
    contentType: "json",
  });
}

export function kalender(callback: Function): void {
  getForType("json", "/rest/kalender", (err?: Error, result?: any) => callback(new FerienIcals(result)));
}

export function saveKalender(kalender: FerienIcals, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/rest/kalender",
    data: kalender,
    title: "Gespeichert",
    text: "Änderungen gespeichert",
    callback,
    contentType: "json",
  });
}

// Image
export function imagenames(callback: Function): void {
  getForType("json", "/rest/imagenames", (err?: Error, result?: { names: string[] }) => callback(result?.names));
}

export function saveImagenames(rows: ImageOverviewRow[], callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/rest/imagenames",
    data: rows,
    title: "Gespeichert",
    text: "Änderungen gespeichert",
    callback,
    contentType: "json",
  });
}

//Mails intern
export function sendMail(message: Message, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/rest/rundmail",
    data: message,
    title: "Gesendet",
    text: "Meil geschickt",
    callback,
    contentType: "json",
  });
}

export function deleteMailinglist(listname: string, callback: Function): void {
  callAndReceive({
    method: "DELETE",
    url: "/rest/mailingliste",
    data: { name: listname },
    title: "Gelöscht",
    text: "Liste gelöscht",
    callback,
    contentType: "json",
  });
}

export function saveMailinglist(list: Mailingliste, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/rest/mailingliste",
    data: list,
    title: "Gespeichert",
    text: "Liste gespeichert",
    callback,
    contentType: "json",
  });
}

// Mails für Veranstaltungen
export function mailRules(callback: Function): void {
  getForType("json", "/rest/mailrule", (err?: Error, result?: any[]) => callback(result?.map((each) => new MailRule(each))) || []);
}

export function deleteMailRule(ruleID: string, callback: Function): void {
  callAndReceive({
    method: "DELETE",
    url: "/rest/mailrule",
    data: { id: ruleID },
    title: "Gelöscht",
    text: "Regel gelöscht",
    callback,
    contentType: "json",
  });
}

export function saveMailRule(rule: MailRule, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/rest/mailrule",
    data: rule,
    title: "Gespeichert",
    text: "Regel gespeichert",
    callback,
    contentType: "json",
  });
}

// Wiki
export function wikisubdirs(callback: Function): void {
  getForType("json", "/rest/wikidirs", (err?: Error, json?: object) => callback(json || []));
}
export function wikiPage(subdir: string, page: string, callback: Function): void {
  getForType("json", `/rest/wikipage/${subdir}/${page}`, (err?: Error, result?: any) => callback(result.content || ""));
}

export function saveWikiPage(subdir: string, page: string, content: string, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: `/rest/wikipage/${subdir}/${page}`,
    data: { content },
    title: "Gespeichert",
    text: "Die Seite wurde gespeichert.",
    callback,
    contentType: "json",
  });
}

export function searchWiki(suchtext: string, callback: Function): void {
  callAndReceive({
    method: "POST",
    url: "/rest/wikipage/search",
    data: { suchtext },
    callback,
    contentType: "json",
  });
}

export function deleteWikiPage(subdir: string, page: string, callback: Function): void {
  callAndReceive({
    method: "DELETE",
    url: `/rest/wikipage/${subdir}/${page}`,
    data: { data: "" },
    callback,
    contentType: "json",
  });
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
