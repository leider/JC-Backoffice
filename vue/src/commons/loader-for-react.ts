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
import * as jose from "jose";
import isMobile from "ismobilejs";

let refreshTokenState: string;

function sleep(ms: number) {
  return new Promise((_) => setTimeout(_, ms));
}
export const globals = {
  jwtToken: "",

  isAuthenticated: async function isAuthenticated() {
    if (refreshTokenState === "START") {
      while (refreshTokenState === "START") {
        await sleep(100);
      }
    }
    if (globals.jwtToken) {
      const decoded = jose.decodeJwt(globals.jwtToken) as {
        [key: string]: any;
      };
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
};

async function standardFetch(params: FetchParams) {
  try {
    const options: AxiosRequestConfig = {
      url: params.url,
      method: params.method,
      data: params.data,
      responseType: params.contentType !== "json" ? "blob" : "json",
    };
    const res = await axios(options);
    return res.data;
  } catch (e) {
    /* empty */
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
    contentType: "json",
  });
}

export async function uploadBeleg(data: FormData) {
  return standardFetch({
    method: "POST",
    url: "/rest/beleg",
    data,
    contentType: "json",
  });
}

export async function logoutManually() {
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
  }
}

function handleVeranstaltungen(result?: any[]): Veranstaltung[] {
  return result?.map((each: any) => new Veranstaltung(each)) || [];
}

export async function veranstaltungenBetween(start: DatumUhrzeit, end: DatumUhrzeit) {
  const result = await getForType("json", `/rest/veranstaltungen/${start.yyyyMM}/${end.yyyyMM}`);
  return handleVeranstaltungen(result);
}

export async function veranstaltungenBetweenYYYYMM(start: string, end: string) {
  const result = await getForType("json", `/rest/veranstaltungen/${start}/${end}`);
  return handleVeranstaltungen(result);
}

export async function veranstaltungenForTeam(selector: "zukuenftige" | "vergangene" | "alle") {
  const result = await getForType("json", `/rest/veranstaltungen/${selector}`);
  return handleVeranstaltungen(result);
}

export async function veranstaltungForUrl(url: string): Promise<Veranstaltung> {
  if (url === "new") {
    return new Veranstaltung();
  }
  if (url.startsWith("copy-of-")) {
    const realUrl = url.substring(8);
    const result = await getForType("json", `/rest/veranstaltungen/${encodeURIComponent(realUrl)}`);
    if (result) {
      const veranstaltung = new Veranstaltung(result);
      veranstaltung.reset();
      veranstaltung.kopf.titel = `Kopie von ${veranstaltung.kopf.titel}`;
      return veranstaltung;
    } else {
      return result;
    }
  }
  const result = await getForType("json", `/rest/veranstaltungen/${encodeURIComponent(url)}`);
  return result ? new Veranstaltung(result) : result;
}

export async function saveVeranstaltung(veranstaltung: Veranstaltung) {
  return standardFetch({
    method: "POST",
    url: "/rest/veranstaltungen",
    data: veranstaltung.toJSON(),
    contentType: "json",
  });
}

export async function deleteVeranstaltungWithId(id: string) {
  return standardFetch({
    method: "DELETE",
    url: "/rest/veranstaltungen",
    data: { id },
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

export async function allUsers(): Promise<User[]> {
  const result = await getForType("json", "/rest/users");
  return result?.users.map((r: any) => new User(r)) || [];
}

export async function saveUser(user: User) {
  return standardFetch({
    method: "POST",
    url: "/rest/user",
    data: user.toJSON(),
    contentType: "json",
  });
}

export async function deleteUser(user: User) {
  return standardFetch({
    method: "DELETE",
    url: "/rest/user",
    data: user.toJSON(),
    contentType: "json",
  });
}

export async function saveNewUser(user: User) {
  return standardFetch({
    method: "PUT",
    url: "/rest/user",
    data: user.toJSON(),
    contentType: "json",
  });
}

export async function changePassword(user: User) {
  return standardFetch({
    method: "POST",
    url: "/rest/user/changePassword",
    data: user.toJSON(),
    contentType: "json",
  });
}

// Programmheft
export async function kalenderFor(jahrMonat: string) {
  const result = await getForType("json", `/rest/programmheft/${jahrMonat}`);
  return result?.id ? new Kalender(result) : new Kalender({ id: jahrMonat, text: "" });
}

export async function saveProgrammheft(kalender: Kalender) {
  return standardFetch({
    method: "POST",
    url: "/rest/programmheft",
    data: kalender,
    contentType: "json",
  });
}

// Optionen & Termine
export async function optionen(): Promise<OptionValues> {
  const result = await getForType("json", "/rest/optionen");
  return result ? new OptionValues(result) : result;
}

export async function saveOptionen(optionen: OptionValues) {
  return standardFetch({
    method: "POST",
    url: "/rest/optionen",
    data: optionen.toJSON(),
    contentType: "json",
  });
}

export async function saveOptionenQuiet(optionen: OptionValues) {
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
    contentType: "json",
  });
}

export async function termine() {
  const result = await getForType("json", "/rest/termine");
  return result?.map((r: any) => new Termin(r)) || [];
}

export async function saveTermine(termine: Termin[]) {
  return standardFetch({
    method: "POST",
    url: "/rest/termine",
    data: termine,
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
    contentType: "json",
  });
}

//Mails intern
export async function sendMail(message: Message) {
  return standardFetch({
    method: "POST",
    url: "/rest/rundmail",
    data: message,
    contentType: "json",
  });
}

export async function deleteMailinglist(listname: string) {
  return standardFetch({
    method: "DELETE",
    url: "/rest/mailingliste",
    data: { name: listname },
    contentType: "json",
  });
}

export async function saveMailinglist(list: Mailingliste) {
  return standardFetch({
    method: "POST",
    url: "/rest/mailingliste",
    data: list,
    contentType: "json",
  });
}

// Mails für Veranstaltungen
export async function mailRules(): Promise<MailRule[]> {
  const result = await getForType("json", "/rest/mailrule");
  return result?.map((each: any) => new MailRule(each)) || [];
}

export async function deleteMailRule(ruleID: string) {
  return standardFetch({
    method: "DELETE",
    url: "/rest/mailrule",
    data: { id: ruleID },
    contentType: "json",
  });
}

export async function saveMailRule(rule: MailRule) {
  return standardFetch({
    method: "POST",
    url: "/rest/mailrule",
    data: rule,
    contentType: "json",
  });
}

// Wiki
export async function wikisubdirs(): Promise<{ dirs: string[] }> {
  const json = await getForType("json", "/rest/wikidirs");
  return json || { dirs: [] };
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

  if (downloadAsFilename || isMobile().any) {
    const link = document.createElement("a");
    link.href = objectURL;
    link.target = "_blank";
    link.download = downloadAsFilename || "temp";
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
