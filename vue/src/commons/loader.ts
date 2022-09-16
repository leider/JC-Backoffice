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

  isAuthenticated: async function isAuthenticated() {
    if (globals.jwtToken) {
      const decoded = jwt.decode(globals.jwtToken) as { [key: string]: any };
      const exp: number = decoded.exp;
      const stillValid = Date.now() + 60000 < exp * 1000; // should be valid one more minute
      if (stillValid) {
        return true;
      }
    }
    if (refreshTokenState !== "START") {
      refreshTokenState = "START";
      const json = await standardFetch({
        method: "POST",
        url: "/refreshToken",
        contentType: "json",
      });
      if (json) {
        globals.jwtToken = json.token;
        refreshTokenState = "FINISHED";
        return json.token;
      }
    } else {
      return false;
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

async function standardFetch(params: FetchParams) {
  const options: AxiosRequestConfig = {
    url: params.url,
    method: params.method,
    data: params.data,
    responseType: params.contentType !== "json" ? "blob" : "json",
    headers: { Authorization: `Bearer ${globals.jwtToken}` },
  };

  try {
    const res = await axios(options);
    if (params.title || params.text) {
      feedbackMessages.addSuccess(params.title || "Erfolgreich", params.text || "---");
    }
    return res.data;
  } catch (e) {
    const err = e as any;
    if (err.response.status === 401) {
      if (router.currentRoute.path !== "/login") {
        const isAuth = await globals.isAuthenticated();
        if (!isAuth) {
          router.push("/login");
          return;
        }
      }
    }

    if (err.response.text) {
      feedbackMessages.addError(`Fehler: ${err.response.status} ${err.response.statusText}`, err.response.text);
    }
    feedbackMessages.addError(`Fehler: ${err.response.status} ${err.response.statusText}`, "");
  }
}

async function getForType(contentType: ContentType, url: string) {
  return standardFetch({ contentType, url, method: "GET" });
}

export async function uploadFile(data: FormData) {
  return standardFetch({
    method: "POST",
    url: "/rest/upload",
    data,
    title: "Gespeichert",
    text: "Datei gespeichert",
    contentType: "other",
  });
}

export async function uploadBeleg(data: FormData) {
  return standardFetch({
    method: "POST",
    url: "/rest/beleg",
    data,
    title: "Erfolgreich",
    text: "Beleg übertragen",
    contentType: "other",
  });
}

export async function logout() {
  await standardFetch({
    method: "POST",
    url: "/rest/logout",
    contentType: "json",
  });
  globals.jwtToken = "";
  return;
}

export async function login(name: string, pass: string) {
  const json = await standardFetch({
    method: "POST",
    url: "/login",
    data: { name, pass },
    contentType: "json",
  });
  if (json) {
    globals.jwtToken = json.token;
  } else {
    router.push("/");
  }
}

function handleVeranstaltungen(result?: any[]) {
  return result?.map((each: any) => new Veranstaltung(each)) || [];
}

export async function veranstaltungenBetween(start: DatumUhrzeit, end: DatumUhrzeit) {
  const result = await getForType("json", `/rest/veranstaltungen/${start.yyyyMM}/${end.yyyyMM}`);
  return handleVeranstaltungen(result);
}

export async function veranstaltungenForTeam(selector: "zukuenftige" | "vergangene" | "alle") {
  const result = await getForType("json", `/rest/veranstaltungen/${selector}`);
  return handleVeranstaltungen(result);
}

export async function veranstaltungForUrl(url: string) {
  const result = await getForType("json", `/rest/veranstaltungen/${encodeURIComponent(url)}`);
  return result ? new Veranstaltung(result) : result;
}

export async function saveVeranstaltung(veranstaltung: Veranstaltung) {
  return standardFetch({
    method: "POST",
    url: "/rest/veranstaltungen",
    data: veranstaltung.toJSON(),
    title: "Gespeichert",
    text: "Veranstaltung gespeichert",
    contentType: "json",
  });
}

export async function deleteVeranstaltungWithId(id: string) {
  return standardFetch({
    method: "DELETE",
    url: "/rest/veranstaltungen",
    data: { id },
    title: "Gelöscht",
    text: "Veranstaltung gelöscht",
    contentType: "json",
  });
}

export async function addUserToSection(veranstaltung: Veranstaltung, section: StaffType) {
  return standardFetch({
    method: "POST",
    url: `/rest/${veranstaltung.fullyQualifiedUrl}/addUserToSection`,
    data: { section },
    contentType: "json",
  });
}

export async function removeUserFromSection(veranstaltung: Veranstaltung, section: StaffType) {
  return standardFetch({
    method: "POST",
    url: `/rest/${veranstaltung.fullyQualifiedUrl}/removeUserFromSection`,
    data: { section },
    contentType: "json",
  });
}

// User
export async function currentUser() {
  try {
    const result = await getForType("json", "/rest/users/current");
    const user = new User(result);
    user.accessrights = new Accessrights(user);
    return user;
  } catch {
    return new User("invalidUser");
  }
}

export async function allUsers() {
  const result = await getForType("json", "/rest/users");
  return result?.users.map((r: any) => new User(r)) || [];
}

export async function saveUser(user: User) {
  return standardFetch({
    method: "POST",
    url: "/rest/user",
    data: user.toJSON(),
    title: "Gespeichert",
    text: "Änderungen gespeichert",
    contentType: "json",
  });
}

export async function deleteUser(user: User) {
  return standardFetch({
    method: "DELETE",
    url: "/rest/user",
    data: user.toJSON(),
    title: "Gelöscht",
    text: "User gelöscht",
    contentType: "json",
  });
}

export async function saveNewUser(user: User) {
  return standardFetch({
    method: "PUT",
    url: "/rest/user",
    data: user.toJSON(),
    title: "Gespeichert",
    text: "Neuer User angelegt",
    contentType: "json",
  });
}

export async function changePassword(user: User) {
  return standardFetch({
    method: "POST",
    url: "/rest/user/changePassword",
    data: user.toJSON(),
    title: "Gespeichert",
    text: "Passwort geändert",
    contentType: "json",
  });
}

// Programmheft
export async function kalenderFor(jahrMonat: string) {
  const result = await getForType("json", `/rest/programmheft/${jahrMonat}`);
  return result?.id ? new Kalender(result) : undefined;
}

export async function saveProgrammheft(kalender: Kalender) {
  return standardFetch({
    method: "POST",
    url: "/rest/programmheft",
    data: kalender,
    title: "Gespeichert",
    text: "Änderungen gespeichert",
    contentType: "json",
  });
}

// Optionen & Termine
export async function optionen() {
  const result = await getForType("json", "/rest/optionen");
  return result ? new OptionValues(result) : result;
}

export async function saveOptionen(optionen: OptionValues) {
  if (optionen.agenturen.length === 0 || optionen.hotels.length === 0 || optionen.kooperationen.length === 0) {
    feedbackMessages.addError("Oooops. Optionen kaputt", "");
    throw new Error("oops, Optionen kaputt??");
  }
  return standardFetch({
    method: "POST",
    url: "/rest/optionen",
    data: optionen.toJSON(),
    title: "Gespeichert",
    text: "Optionen gespeichert",
    contentType: "json",
  });
}

export async function saveOptionenQuiet(optionen: OptionValues) {
  if (optionen.agenturen.length === 0 || optionen.hotels.length === 0 || optionen.kooperationen.length === 0) {
    feedbackMessages.addError("Oooops. Optionen kaputt", "");
    throw new Error("oops, Optionen kaputt??");
  }
  return standardFetch({
    method: "POST",
    url: "/rest/optionen",
    data: optionen.toJSON(),
    contentType: "json",
  });
}

export async function orte() {
  const result = await getForType("json", "/rest/orte");
  return result ? new Orte(result) : result;
}

export async function saveOrte(orte: Orte) {
  return standardFetch({
    method: "POST",
    url: "/rest/orte",
    data: orte.toJSON(),
    title: "Gespeichert",
    text: "Orte aktualisiert",
    contentType: "json",
  });
}

export async function termine() {
  const result = await getForType("json", "/rest/termine");
  return result?.map((r: any) => new Termin(r)) || [];
}

export async function saveTermin(termin: Termin) {
  return standardFetch({
    method: "POST",
    url: "/rest/termin",
    data: termin,
    title: "Gespeichert",
    text: "Termin gespeichert",
    contentType: "json",
  });
}

export async function deleteTermin(terminID: string) {
  return standardFetch({
    method: "DELETE",
    url: "/rest/termin",
    data: { id: terminID },
    title: "Gelöscht",
    text: "Termin gelöscht",
    contentType: "json",
  });
}

export async function kalender() {
  const result = await getForType("json", "/rest/kalender");
  return result ? new FerienIcals(result) : result;
}

export async function saveKalender(kalender: FerienIcals) {
  standardFetch({
    method: "POST",
    url: "/rest/kalender",
    data: kalender,
    title: "Gespeichert",
    text: "Änderungen gespeichert",
    contentType: "json",
  });
}

// Image
export async function imagenames() {
  const result = await getForType("json", "/rest/imagenames");
  return result?.names;
}

export async function saveImagenames(rows: ImageOverviewRow[]) {
  return standardFetch({
    method: "POST",
    url: "/rest/imagenames",
    data: rows,
    title: "Gespeichert",
    text: "Änderungen gespeichert",
    contentType: "json",
  });
}

//Mails intern
export async function sendMail(message: Message) {
  return standardFetch({
    method: "POST",
    url: "/rest/rundmail",
    data: message,
    title: "Gesendet",
    text: "Meil geschickt",
    contentType: "json",
  });
}

export async function deleteMailinglist(listname: string) {
  return standardFetch({
    method: "DELETE",
    url: "/rest/mailingliste",
    data: { name: listname },
    title: "Gelöscht",
    text: "Liste gelöscht",
    contentType: "json",
  });
}

export async function saveMailinglist(list: Mailingliste) {
  return standardFetch({
    method: "POST",
    url: "/rest/mailingliste",
    data: list,
    title: "Gespeichert",
    text: "Liste gespeichert",
    contentType: "json",
  });
}

// Mails für Veranstaltungen
export async function mailRules() {
  const result = await getForType("json", "/rest/mailrule");
  return result?.map((each: any) => new MailRule(each)) || [];
}

export async function deleteMailRule(ruleID: string) {
  return standardFetch({
    method: "DELETE",
    url: "/rest/mailrule",
    data: { id: ruleID },
    title: "Gelöscht",
    text: "Regel gelöscht",
    contentType: "json",
  });
}

export async function saveMailRule(rule: MailRule) {
  return standardFetch({
    method: "POST",
    url: "/rest/mailrule",
    data: rule,
    title: "Gespeichert",
    text: "Regel gespeichert",
    contentType: "json",
  });
}

// Wiki
export async function wikisubdirs() {
  const json = await getForType("json", "/rest/wikidirs");
  return json || [];
}

export async function wikiPage(subdir: string, page: string) {
  const result = await getForType("json", `/rest/wikipage/${subdir}/${page}`);
  return result?.content || "";
}

export async function saveWikiPage(subdir: string, page: string, content: string) {
  return standardFetch({
    method: "POST",
    url: `/rest/wikipage/${subdir}/${page}`,
    data: { content },
    title: "Gespeichert",
    text: "Die Seite wurde gespeichert.",
    contentType: "json",
  });
}

export async function searchWiki(suchtext: string) {
  return standardFetch({
    method: "POST",
    url: "/rest/wikipage/search",
    data: { suchtext },
    contentType: "json",
  });
}

export async function deleteWikiPage(subdir: string, page: string) {
  return standardFetch({
    method: "DELETE",
    url: `/rest/wikipage/${subdir}/${page}`,
    data: { data: "" },
    contentType: "json",
  });
}

// Calendar
export async function calendarEventSources(start: Date, end: Date) {
  return getForType("json", `/rest/fullcalendarevents.json?start=${start.toISOString()}&end=${end.toISOString()}`);
}

// Special
export async function openKassenzettel(veranstaltung: Veranstaltung) {
  const pdf = await getForType("pdf", `/pdf/kassenzettel/${veranstaltung.url}`);
  if (pdf) {
    showFile(pdf);
  }
}

export async function openVertrag(veranstaltung: Veranstaltung) {
  const pdf = await getForType("pdf", `/pdf/vertrag/${veranstaltung.url}/${veranstaltung.vertrag.sprache.toLowerCase()}`);
  if (pdf) {
    showFile(pdf);
  }
}

export async function imgZip(yymm: string) {
  const pdf = await getForType("zip", `/imgzip/${yymm}`);
  if (pdf) {
    showFile(pdf, `JazzClub_Bilder_${DatumUhrzeit.forYYMM(yymm).fuerKalenderViews}.zip`);
  }
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
