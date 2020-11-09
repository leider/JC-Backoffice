/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch, { Response } from "cross-fetch";
import Veranstaltung, { ImageOverviewRow } from "../../lib/veranstaltungen/object/veranstaltung";
import User from "../../lib/users/user";
import { StaffType } from "../../lib/veranstaltungen/object/staff";
import Kalender from "../../lib/programmheft/kalender";
import DatumUhrzeit from "../../lib/commons/DatumUhrzeit";
import OptionValues from "../../lib/optionen/optionValues";
import Orte from "../../lib/optionen/orte";
import Message from "../../lib/mailsender/message";
import { Mailingliste } from "../../lib/users/users";
import MailRule from "../../lib/mailsender/mailRule";
import Termin from "../../lib/optionen/termin";
import FerienIcals from "../../lib/optionen/ferienIcals";
import { feedbackMessages } from "@/views/general/FeedbackMessages";
import Accessrights from "../../lib/commons/accessrights";

function standardFetch(url: string, callback: any, title?: string, text?: string, postHeader?: RequestInit): void {
  function handleErrorIfAny(response: Response): any {
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
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
  standardFetch(url, callback);
}

const defaultPostHeader: RequestInit = {
  method: "POST",
  mode: "same-origin",
  cache: "no-cache",
  credentials: "same-origin",
  redirect: "follow",
  referrer: "no-referrer",
};

function postAndReceive(url: string, data: any, callback: any, title?: string, text?: string): void {
  getJson("/vue-spa/csrf-token.json", (err: Error, res: any) => {
    const postHeader: RequestInit = {
      ...defaultPostHeader,
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": res.token },
      body: JSON.stringify(data),
    };
    standardFetch(url, callback, title, text, postHeader);
  });
}

function postAndReceiveForFiles(url: string, data: FormData, callback: any, title: string, text: string): void {
  getJson("/vue-spa/csrf-token.json", (err: Error, res: any) => {
    const postHeader: RequestInit = {
      ...defaultPostHeader,
      headers: { "X-CSRF-TOKEN": res.token },
      body: data,
    };
    standardFetch(url, callback, title, text, postHeader);
  });
}

export function uploadFile(data: FormData, callback: Function): void {
  postAndReceiveForFiles("/veranstaltungen/upload", data, callback, "Gespeichert", "Datei gespeichert");
}
function veranstaltungenCallback(callback: Function) {
  return (err?: Error, result?: object[]) => {
    callback(result?.map((r) => new Veranstaltung(r)) || []);
  };
}

export function veranstaltungenForTeam(selector: "zukuenftige" | "vergangene" | "alle", callback: Function): void {
  getJson(`/veranstaltungen/${selector}.json`, veranstaltungenCallback(callback));
}

export function saveVeranstaltung(veranstaltung: Veranstaltung, callback: Function): void {
  postAndReceive("/veranstaltungen/saveVeranstaltung", veranstaltung.toJSON(), callback, "Gespeichert", "Veranstaltung gespeichert");
}

export function deleteVeranstaltungWithId(id: string, callback: Function): void {
  postAndReceive("/veranstaltungen/deleteVeranstaltung", { id }, callback, "Gelöscht", "Veranstaltung gelöscht");
}

export function addUserToSection(veranstaltung: Veranstaltung, section: StaffType, callback: Function): void {
  postAndReceive(`${veranstaltung.fullyQualifiedUrl()}/addUserToSection`, { section }, callback);
}

export function removeUserFromSection(veranstaltung: Veranstaltung, section: StaffType, callback: Function): void {
  postAndReceive(`${veranstaltung.fullyQualifiedUrl()}/removeUserFromSection`, { section }, callback);
}

// User
export function currentUser(callback: Function): void {
  getJson("/users/user.json", (err?: Error, result?: object) => {
    const user = new User(result);
    user.accessrights = new Accessrights(user);
    callback(user);
  });
}

export function allUsers(callback: Function): void {
  getJson("/users/allusers.json", (err?: Error, result?: { users: object[] }) => {
    callback(result?.users.map((r) => new User(r)) || []);
  });
}

export function saveUser(user: User, callback: Function): void {
  postAndReceive("/users/saveUser", user.toJSON(), callback, "Gespeichert", "Änderungen gespeichert");
}

export function deleteUser(user: User, callback: Function): void {
  postAndReceive("/users/deleteUser", user.toJSON(), callback, "Gelöscht", "User gelöscht");
}

export function saveNewUser(user: User, callback: Function): void {
  postAndReceive("/users/saveNewUser", user.toJSON(), callback, "Gespeichert", "Neuer User angelegt");
}

export function changePassword(user: User, callback: Function): void {
  postAndReceive("/users/changePassword", user.toJSON(), callback, "Gespeichert", "Passwort geändert");
}

export function wikisubdirs(callback: Function): void {
  getJson("/vue-spa/wikisubdirs.json", (err?: Error, json?: object) => callback(json || []));
}

// Programmheft
export function kalenderFor(jahrMonat: string, callback: Function): void {
  getJson(`/programmheft/${jahrMonat}.json`, (err?: Error, result?: { id: string; text: string }) => {
    callback(new Kalender(result));
  });
}

export function veranstaltungenBetween(start: DatumUhrzeit, end: DatumUhrzeit, callback: Function): void {
  getJson(`/veranstaltungen/${start.yyyyMM}/${end.yyyyMM}/list.json`, veranstaltungenCallback(callback));
}

export function saveProgrammheft(kalender: Kalender, callback: Function): void {
  postAndReceive("/programmheft/saveProgrammheft", kalender, callback, "Gespeichert", "Änderungen gespeichert");
}

// Veranstaltung bearbeiten
export function veranstaltungForUrl(url: string, callback: Function): void {
  getJson(`/veranstaltungen/${encodeURIComponent(url)}.json`, (err?: Error, result?: any) => callback(new Veranstaltung(result)));
}

// Optionen & Termine
export function optionen(callback: Function): void {
  getJson("/optionen/optionen.json", (err?: Error, result?: any) => callback(new OptionValues(result)));
}

export function saveOptionen(optionen: OptionValues, callback: Function): void {
  postAndReceive("/optionen/saveOptionen", optionen.toJSON(), callback, "Gespeichert", "Optionen gespeichert");
}

export function saveOptionenQuiet(optionen: OptionValues, callback: Function): void {
  postAndReceive("/optionen/saveOptionen", optionen.toJSON(), callback);
}

export function orte(callback: Function): void {
  getJson("/optionen/orte.json", (err?: Error, result?: any) => callback(new Orte(result)));
}

export function saveOrte(orte: Orte, callback: Function): void {
  postAndReceive("/optionen/saveOrte", orte.toJSON(), callback, "Gespeichert", "Orte aktualisiert");
}

export function termine(callback: Function): void {
  getJson("/optionen/termine.json", (err?: Error, result?: any) => callback(result?.map((r: any) => new Termin(r))) || []);
}

export function deleteTermin(terminID: string, callback: Function): void {
  postAndReceive("/optionen/deletetermin", { id: terminID }, callback, "Gelöscht", "Termin gelöscht");
}

export function saveTermin(termin: Termin, callback: Function): void {
  postAndReceive("/optionen/savetermin", termin, callback, "Gespeichert", "Termin gespeichert");
}

export function kalender(callback: Function): void {
  getJson("/optionen/kalender.json", (err?: Error, result?: any) => callback(new FerienIcals(result)));
}

export function saveKalender(kalender: FerienIcals, callback: Function): void {
  postAndReceive("/optionen/savekalender", kalender, callback, "Gespeichert", "Änderungen gespeichert");
}

// Image
export function imagenames(callback: Function): void {
  getJson("/image/allImagenames.json", (err?: Error, result?: { names: string[] }) => callback(result?.names));
}

export function saveImagenames(rows: ImageOverviewRow[], callback: Function): void {
  postAndReceive("/image/imagenamesChanged", rows, callback, "Gespeichert", "Änderungen gespeichert");
}

//Mails intern
export function sendMail(message: Message, callback: Function): void {
  postAndReceive("/users/rundmail", message, callback, "Gesendet", "Meil geschickt");
}

export function deleteMailinglist(listname: string, callback: Function): void {
  postAndReceive("/users/deleteliste", { name: listname }, callback, "Gelöscht", "Liste gelöscht");
}

export function saveMailinglist(list: Mailingliste, callback: Function): void {
  postAndReceive("/users/saveliste", list, callback, "Gespeichert", "Liste gespeichert");
}

// Mails für Veranstaltungen
export function mailRules(callback: Function): void {
  getJson("/mailsender/rules.json", (err?: Error, result?: any[]) => callback(result?.map((each) => new MailRule(each))) || []);
}

export function deleteMailRule(ruleID: string, callback: Function): void {
  postAndReceive("/mailsender/deleteRule", { id: ruleID }, callback, "Gelöscht", "Regel gelöscht");
}

export function saveMailRule(rule: MailRule, callback: Function): void {
  postAndReceive("/mailsender/saveRule", rule, callback, "Gespeichert", "Regel gespeichert");
}

// Wiki
export function wikiSubdir(subdir: string, callback: Function): void {
  getJson(`/wiki/list/${subdir}/alle.json`, (err?: Error, result?: any[]) => callback(result || []));
}

export function wikiPage(subdir: string, page: string, callback: Function): void {
  getJson(`/wiki/${subdir}/${page}.json`, (err?: Error, result?: any) => callback(result.content || ""));
}

export function saveWikiPage(subdir: string, page: string, content: string, callback: Function): void {
  postAndReceive(`/wiki/${subdir}/${page}`, { content }, callback, "Gespeichert", "Die Seite wurde gespeichert.");
}

export function searchWiki(suchtext: string, callback: Function): void {
  postAndReceive("/wiki/search", { suchtext }, callback);
}

export function deleteWikiPage(subdir: string, page: string, callback: Function): void {
  postAndReceive(`/wiki/delete/${subdir}/${page}`, { data: "" }, callback);
}
