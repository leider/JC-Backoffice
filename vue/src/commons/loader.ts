/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, Method } from "axios";

import User from "jc-shared/user/user";
import Kalender from "jc-shared/programmheft/kalender";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import Message from "jc-shared/mail/message";
import { Mailingliste } from "jc-shared/user/users";
import MailRule from "jc-shared/mail/mailRule";
import Termin, { TerminFilterOptions } from "jc-shared/optionen/termin";
import FerienIcals from "jc-shared/optionen/ferienIcals";
import Accessrights from "jc-shared/user/accessrights";
import { StaffType } from "jc-shared/veranstaltung/staff";
import Veranstaltung, { GastArt, ImageOverviewRow, NameWithNumber } from "jc-shared/veranstaltung/veranstaltung";
import isMobile from "ismobilejs";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { Rider } from "jc-shared/rider/rider.ts";

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

// Staff
export async function addOrRemoveUserToSection(veranstaltung: Veranstaltung, section: StaffType, add: boolean) {
  return standardFetch({
    method: "POST",
    url: `/rest/${veranstaltung.fullyQualifiedUrl}/${add ? "addUserToSection" : "removeUserFromSection"}`,
    data: { section },
    contentType: "json",
  });
}

// Gäste
export async function updateGastInSection(veranstaltung: Veranstaltung, item: NameWithNumber, art: GastArt) {
  return standardFetch({
    method: "POST",
    url: `/rest/${veranstaltung.fullyQualifiedUrl}/updateGastInSection`,
    data: { item, art },
    contentType: "json",
  });
}

// Vermietungen
function handleVermietungen(result?: any[]): Vermietung[] {
  return result?.map((each: any) => new Vermietung(each)) || [];
}

export async function vermietungenForTeam(selector: "zukuenftige" | "vergangene" | "alle") {
  const result = await getForType("json", `/rest/vermietungen/${selector}`);
  return handleVermietungen(result);
}

export async function vermietungenBetweenYYYYMM(start: string, end: string) {
  const result = await getForType("json", `/rest/vermietungen/${start}/${end}`);
  return handleVermietungen(result);
}

export async function vermietungForUrl(url: string): Promise<Vermietung> {
  if (url === "new") {
    return new Vermietung();
  }
  if (url.startsWith("copy-of-")) {
    const realUrl = url.substring(8);
    const result = await getForType("json", `/rest/vermietungen/${encodeURIComponent(realUrl)}`);
    if (result) {
      const vermietung = new Vermietung(result);
      vermietung.reset();
      vermietung.kopf.titel = `Kopie von ${vermietung.kopf.titel}`;
      return vermietung;
    } else {
      return result;
    }
  }
  const result = await getForType("json", `/rest/vermietungen/${encodeURIComponent(url)}`);
  return result ? new Vermietung(result) : result;
}

export async function saveVermietung(vermietung: Vermietung) {
  return standardFetch({
    method: "POST",
    url: "/rest/vermietungen",
    data: vermietung.toJSON(),
    contentType: "json",
  });
}

export async function deleteVermietungWithId(id: string) {
  return standardFetch({
    method: "DELETE",
    url: "/rest/vermietungen",
    data: { id },
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

// Rider
export async function riderFor(url: string) {
  const result = await getForType("json", `/rest/riders/${url}`);
  return new Rider(result);
}

export async function saveRider(rider: Rider) {
  return standardFetch({
    method: "POST",
    url: "/rest/riders",
    data: rider,
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

export async function saveMailinglists(lists: Mailingliste[]) {
  return standardFetch({
    method: "POST",
    url: "/rest/mailinglisten",
    data: lists,
    contentType: "json",
  });
}

// Mails für Veranstaltungen
export async function mailRules(): Promise<MailRule[]> {
  const result = await getForType("json", "/rest/mailrule");
  return result?.map((each: any) => new MailRule(each)) || [];
}

export async function saveMailRules(rules: MailRule[]) {
  return standardFetch({
    method: "POST",
    url: "/rest/mailrules",
    data: rules,
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
export async function calendarEventSources(start: Date, end: Date, options?: TerminFilterOptions) {
  if (options) {
    return getForType(
      "json",
      `/rest/fullcalendarevents.json?start=${start.toISOString()}&end=${end.toISOString()}&options=${JSON.stringify(options)}`,
    );
  }
  return getForType("json", `/rest/fullcalendarevents.json?start=${start.toISOString()}&end=${end.toISOString()}`);
}

// Special

export async function exportRiderAsJson(riderJson: any) {
  const str = JSON.stringify(riderJson);
  const bytes = new TextEncoder().encode(str);
  const blob = new Blob([bytes], {
    type: "application/json;charset=utf-8",
  });
  return showFile(blob, "rider.json");
}

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

export async function openAngebotRechnung(vermietung: Vermietung) {
  const pdf = await getForType("pdf", `/pdf/vermietungAngebot/${vermietung.url}/${vermietung.art}`);
  if (pdf) {
    showFile(pdf);
  }
}

export async function imgFullsize(url: any) {
  const img = await getForType("other", `/upload/${url}`);
  if (img) {
    showFile(img, url);
  }
}

export async function imgzipForVeranstaltung(veranstaltung: Veranstaltung) {
  const zip = await getForType("zip", `/imgzipForVeranstaltung/${veranstaltung.url}`);
  if (zip) {
    showFile(zip, `JazzClub_Bilder_${veranstaltung.kopf.titel}.zip`);
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
