/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig, Method } from "axios";

import User from "jc-shared/user/user";
import Kalender from "jc-shared/programmheft/kalender";
import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import Message from "jc-shared/mail/message";
import { Mailingliste } from "jc-shared/user/users";
import MailRule from "jc-shared/mail/mailRule";
import Termin, { TerminFilterOptions } from "jc-shared/optionen/termin";
import FerienIcals from "jc-shared/optionen/ferienIcals";
import Konzert, { GastArt, ImageOverviewRow, NameWithNumber } from "../../../shared/konzert/konzert.ts";
import isMobile from "ismobilejs";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { Rider } from "jc-shared/rider/rider.ts";
import * as jose from "jose";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { HistoryType } from "jc-backend/rest/history.ts";

type ContentType = "json" | "pdf" | "zip" | "other";

type FetchParams = {
  url: string;
  contentType: ContentType;
  method: Method;
  data?: any;
};

export async function loginPost(name: string, pass: string) {
  const token = await axios.post("/login", { name, pass });
  return refreshTokenPost(token.data.token);
}

export async function logoutManually() {
  return axios.post("/logout");
}

export async function refreshTokenPost(tokenFromLogin?: string) {
  let token = tokenFromLogin;
  if (!tokenFromLogin) {
    const result = await axios.post("/refreshToken");
    token = result.data.token;
  }
  if (!token) {
    return "";
  }
  axios.defaults.headers.Authorization = `Bearer ${token}`;
  return token;
}

async function standardFetch(params: FetchParams) {
  if (!axios.defaults.headers.Authorization) {
    await refreshTokenPost();
  } else {
    const token = (axios.defaults.headers.Authorization as string).replace("Bearer ", "");
    const decoded = jose.decodeJwt<{ exp: number }>(token);
    if (decoded.exp * 1000 - Date.now() < 0) {
      await refreshTokenPost();
      // eslint-disable-next-line no-console
      console.log("token veraltet");
    }
  }
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
    // const token = await refreshTokenPost();
    // if (token) {
    //   return standardFetch(params);
    // }
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

function handleVeranstaltungen(result?: any[]): Konzert[] {
  return result?.map((each: any) => new Konzert(each)) || [];
}

export async function konzerteBetweenYYYYMM(start: string, end: string) {
  const result = await getForType("json", `/rest/konzerte/${start}/${end}`);
  return handleVeranstaltungen(result);
}

export async function konzerteForTeam(selector: "zukuenftige" | "vergangene" | "alle") {
  const result = await getForType("json", `/rest/konzerte/${selector}`);
  return handleVeranstaltungen(result);
}

export async function konzertForUrl(url: string): Promise<Konzert> {
  if (url === "new") {
    return new Konzert();
  }
  if (url.startsWith("copy-of-")) {
    const realUrl = url.substring(8);
    const result = await getForType("json", `/rest/konzert/${encodeURIComponent(realUrl)}`);
    if (result) {
      const konzert = new Konzert(result);
      konzert.reset();
      konzert.kopf.titel = `Kopie von ${konzert.kopf.titel}`;
      return konzert;
    } else {
      return result;
    }
  }
  const result = await getForType("json", `/rest/konzert/${encodeURIComponent(url)}`);
  return result ? new Konzert(result) : result;
}

export async function saveKonzert(konzert: Konzert) {
  return standardFetch({
    method: "POST",
    url: "/rest/konzert",
    data: konzert.toJSON(),
    contentType: "json",
  });
}

export async function deleteKonzertWithId(id: string) {
  return standardFetch({
    method: "DELETE",
    url: "/rest/konzert",
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
export async function updateGastInSection(konzert: Konzert, item: NameWithNumber, art: GastArt) {
  return standardFetch({
    method: "POST",
    url: `/rest/${konzert.fullyQualifiedUrl}/updateGastInSection`,
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
    const result = await getForType("json", `/rest/vermietung/${encodeURIComponent(realUrl)}`);
    if (result) {
      const vermietung = new Vermietung(result);
      vermietung.reset();
      vermietung.kopf.titel = `Kopie von ${vermietung.kopf.titel}`;
      return vermietung;
    } else {
      return result;
    }
  }
  const result = await getForType("json", `/rest/vermietung/${encodeURIComponent(url)}`);
  return result ? new Vermietung(result) : result;
}

export async function saveVermietung(vermietung: Vermietung) {
  return standardFetch({
    method: "POST",
    url: "/rest/vermietung",
    data: vermietung.toJSON(),
    contentType: "json",
  });
}

export async function deleteVermietungWithId(id: string) {
  return standardFetch({
    method: "DELETE",
    url: "/rest/vermietung",
    data: { id },
    contentType: "json",
  });
}

// User
export async function currentUser() {
  try {
    const result = await getForType("json", "/rest/users/current");
    return new User(result);
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
  return (result?.names as string[]) || [];
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

// History
export async function historyIdsFor(collection: string) {
  const result = await getForType("json", `/rest/history/${collection}`);
  return result as { id: string; time: string; state: string }[];
}

export async function historyRowsFor(collection: string, id: string) {
  const result = await getForType("json", `/rest/history/${collection}/${encodeURIComponent(id)}`);
  return result as HistoryType[];
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

export async function openKassenzettel(konzert: Konzert) {
  const pdf = await getForType("pdf", `/pdf/kassenzettel/${konzert.url}`);
  if (pdf) {
    showFile(pdf);
  }
}

export async function openVertrag(konzert: Konzert) {
  const pdf = await getForType("pdf", `/pdf/vertrag/${konzert.url}/${konzert.vertrag.sprache.toLowerCase()}`);
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

export async function imgzipForVeranstaltung(konzert: Konzert) {
  const zip = await getForType("zip", `/imgzipForVeranstaltung/${konzert.url}`);
  if (zip) {
    showFile(zip, `JazzClub_Bilder_${konzert.kopf.titel}.zip`);
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
