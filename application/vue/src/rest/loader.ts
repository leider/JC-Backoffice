import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";

import User from "jc-shared/user/user.ts";
import Kalender from "jc-shared/programmheft/kalender.ts";
import OptionValues from "jc-shared/optionen/optionValues.ts";
import Orte from "jc-shared/optionen/orte.ts";
import Users, { Mailingliste } from "jc-shared/user/users.ts";
import MailRule from "jc-shared/mail/mailRule.ts";
import Termin, { TerminEvent, TerminFilterOptions } from "jc-shared/optionen/termin.ts";
import FerienIcals from "jc-shared/optionen/ferienIcals.ts";
import Konzert, { GastArt, ImageOverviewRow, NameWithNumber } from "jc-shared/konzert/konzert.ts";
import isMobile from "ismobilejs";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import { Rider } from "jc-shared/rider/rider.ts";
import * as jose from "jose";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { HistoryDBType, HistoryObjectOverview } from "jc-shared/history/history.ts";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";
import map from "lodash/map";
import KonzertWithRiderBoxes from "jc-shared/konzert/konzertWithRiderBoxes.ts";
import { historyFromRawRows } from "@/rest/historyObject.ts";
import { refreshTokenPost } from "@/rest/authenticationRequests.ts";
import sortBy from "lodash/sortBy";

type ContentType = "pdf" | "zip" | "other";

type FetchParams<T, R> = {
  urlPrefix?: string;
  url: string;
  contentType?: ContentType;
  method: Method;
  data?: T;
  resType?: R;
};

async function get<T, R>(params: Omit<FetchParams<T, R>, "method">) {
  return standardFetch({ ...params, method: "GET" });
}

async function loeschen<T, R>(params: Omit<FetchParams<T, R>, "method">) {
  return standardFetch({ ...params, method: "DELETE" });
}

async function post<T, R = T>(params: Omit<FetchParams<T, R>, "method">) {
  return standardFetch<T, R>({ ...params, method: "POST" });
}

async function standardFetch<T, R>({ urlPrefix = "/rest", url, method, data, contentType }: FetchParams<T, R>) {
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
  const options: AxiosRequestConfig<T> = { url: urlPrefix + url, method: method, data: data, responseType: contentType ? "blob" : "json" };
  const res = await axios<T, AxiosResponse<R>>(options);
  return res.data;
}

export async function uploadFile(data: FormData) {
  const result = await post({ url: "/upload", data, resType: new Konzert() });
  return new Konzert(result);
}

export async function uploadWikiImage(data: FormData) {
  return await post({ url: "/wiki/upload", data, resType: { url: "" } });
}

function handleVeranstaltungen(result?: Konzert[]): Konzert[] {
  return map(result, (each) => new Konzert(each));
}

export async function konzerteBetweenYYYYMM(start: string, end: string) {
  const result = await get({ url: `/konzerte/${start}/${end}`, resType: [new Konzert()] });
  return handleVeranstaltungen(result);
}

export async function konzerteForToday() {
  const result = await get({ url: `/konzerte/fortoday`, resType: [new Konzert()] });
  return handleVeranstaltungen(result);
}

export async function konzerteForTeam(selector: "zukuenftige" | "vergangene" | "alle") {
  const result = await get({ url: `/konzerte/${selector}`, resType: [new Konzert()] });
  return handleVeranstaltungen(result);
}

export async function konzertWithRiderForUrl(url: string): Promise<KonzertWithRiderBoxes> {
  const emptyResult = new KonzertWithRiderBoxes();
  if (url === "new") {
    return emptyResult;
  }
  if (url.startsWith("copy-of-")) {
    const realUrl = url.substring(8);
    const result = await get({ url: `/konzert/${encodeURIComponent(realUrl)}`, resType: new Konzert() });
    if (result) {
      const konzert = new KonzertWithRiderBoxes(result);
      konzert.reset();
      return konzert;
    } else {
      return emptyResult;
    }
  }
  const konzert = await get({ url: `/konzert/${encodeURIComponent(url)}`, resType: new Konzert() });
  const rider = await get({ url: `/riders/${url}`, resType: new Rider() });
  return konzert ? new KonzertWithRiderBoxes({ ...konzert, riderBoxes: rider.boxes }) : emptyResult;
}

export async function saveKonzert(konzert: Konzert) {
  const result = await post({ url: "/konzert", data: konzert });
  return new Konzert(result);
}

export async function deleteKonzertWithId(id: string) {
  return loeschen({ url: "/konzert", data: { id } });
}

// Staff
export async function addOrRemoveUserToSection(veranstaltung: Veranstaltung, section: StaffType, add: boolean) {
  const action = add ? "addUserToSection" : "removeUserFromSection";
  const result = await post({ url: `/rest${veranstaltung.fullyQualifiedUrl}/${action}`, data: { section }, resType: veranstaltung });
  return veranstaltung.isVermietung ? new Vermietung(result) : new Konzert(result);
}

// Gäste
export async function updateGastInSection(konzert: Konzert, item: NameWithNumber, art: GastArt) {
  const result = await post({ url: `/rest${konzert.fullyQualifiedUrl}/updateGastInSection`, data: { item, art }, resType: konzert });
  return new Konzert(result);
}

// Vermietungen
function handleVermietungen(result?: Vermietung[]): Vermietung[] {
  return map(result, (each) => new Vermietung(each));
}

export async function vermietungenForTeam(selector: "zukuenftige" | "vergangene" | "alle") {
  const result = await get({ url: `/vermietungen/${selector}`, resType: [new Vermietung()] });
  return handleVermietungen(result);
}

export async function vermietungenBetweenYYYYMM(start: string, end: string) {
  const result = await get({ url: `/vermietungen/${start}/${end}`, resType: [new Vermietung()] });
  return handleVermietungen(result);
}

export async function vermietungForUrl(url: string): Promise<Vermietung> {
  if (url === "new") {
    return new Vermietung();
  }
  if (url.startsWith("copy-of-")) {
    const realUrl = url.substring(8);
    const result = await get({ url: `/vermietung/${encodeURIComponent(realUrl)}`, resType: new Vermietung() });
    if (result) {
      const vermietung = new Vermietung(result);
      vermietung.reset();
      return vermietung;
    } else {
      return result;
    }
  }
  const result = await get({ url: `/vermietung/${encodeURIComponent(url)}`, resType: new Vermietung() });
  return result ? new Vermietung(result) : result;
}

export async function saveVermietung(vermietung: Vermietung) {
  const result = await post({ url: "/vermietung", data: vermietung });
  return new Vermietung(result);
}

export async function deleteVermietungWithId(id: string) {
  return loeschen({ url: "/vermietung", data: { id } });
}

// User
export async function currentUser() {
  try {
    const result = await get({ url: "/users/current", resType: {} as User });
    return new User(result);
  } catch {
    return new User({ id: "invalidUser" });
  }
}

export async function allUsers(): Promise<User[]> {
  const result = await get({ url: "/users", resType: [{} as User] });
  return map(result, (user) => new User(user));
}

export async function saveUser(user: User) {
  const result = await post({ url: "/user", data: user });
  return new User(result);
}

export async function deleteUser(user: User) {
  return loeschen({ url: "/user", data: user });
}

export async function saveNewUser(user: User) {
  return standardFetch({ method: "PUT", url: "/user", data: user });
}

export async function changePassword(user: User) {
  const result = await post({ url: "/user/changePassword", data: user });
  return new User(result);
}

// Programmheft
export async function kalenderFor(jahrMonat: string) {
  const result = await get({ url: `/programmheft/${jahrMonat}`, resType: new Kalender() });
  return result?.id ? new Kalender(result) : new Kalender({ id: jahrMonat });
}

export async function alleKalender() {
  const result = await get({ url: "/programmheft/alle", resType: [new Kalender()] });
  return result.length > 0 ? map(result, (r) => new Kalender(r)) : [];
}

export async function saveProgrammheft(kalender: Kalender) {
  const result = await post({ url: "/programmheft", data: kalender });
  return new Kalender(result);
}

// Rider
export async function saveRider(rider: Rider) {
  const result = await post({ url: "/riders", data: rider });
  return new Rider(result);
}

// Optionen & Termine
export async function optionen(): Promise<OptionValues> {
  const result = await get({ url: "/optionen", resType: new OptionValues() });
  return new OptionValues(result);
}

export async function saveOptionen(optionen: OptionValues) {
  const result = await post({ url: "/optionen", data: optionen });
  return new OptionValues(result);
}

export async function orte() {
  const result = await get({ url: "/orte", resType: new Orte() });
  return new Orte(result);
}

export async function saveOrte(orte: Orte) {
  const result = await post({ url: "/orte", data: orte });
  return new Orte(result);
}

export async function termine() {
  const result = await get({ url: "/termine", resType: [new Termin()] });
  return map(result, (r) => new Termin(r)) ?? [];
}

export async function saveTermine(termine: Termin[]) {
  const result = await post({ url: "/termine", data: termine });
  return map(result, (r) => new Termin(r)) ?? [];
}

export async function kalender() {
  const result = await get({ url: "/kalender", resType: new FerienIcals() });
  return result ? new FerienIcals(result) : result;
}

export async function saveKalender(kalender: FerienIcals) {
  const result = await post({ url: "/kalender", data: kalender });
  return result ? new FerienIcals(result) : result;
}

// Image
export async function imagenames() {
  const result = await get({ url: "/imagenames", resType: { names: [""] } });
  return result?.names ?? [];
}

export async function saveImagenames(rows: ImageOverviewRow[]) {
  await post({ url: "/imagenames", data: rows, resType: { names: [""] } });
  return rows;
}

//Mails intern
export async function sendMail(formData: FormData) {
  return post({ url: "/rundmail", data: formData, resType: {} as SentMessageInfo });
}

export async function allMailinglists() {
  const result = await get({ url: "/mailinglisten", resType: [] as User[] });
  return { lists: sortBy(new Users(result ?? []).mailinglisten, "name") };
}

export async function saveMailinglists({ lists }: { lists: Mailingliste[] }) {
  const result = await post({ url: "/mailinglisten", data: lists, resType: [] as User[] });
  return { lists: sortBy(new Users(result ?? []).mailinglisten, "name") };
}

// Mails für Veranstaltungen
export async function mailRules() {
  const result = await get({ url: "/mailrule", resType: [new MailRule()] });
  return map(result, (each) => new MailRule(each));
}

export async function saveMailRules(rules: MailRule[]) {
  return post({ url: "/mailrules", data: rules });
}

// Wiki
export async function wikisubdirs() {
  const json = await get({ url: "/wikidirs", resType: { dirs: [""] } });
  return json ?? { dirs: [] };
}

export async function wikiPage(subdir: string, page: string) {
  const result = await get({ url: `/wikipage/${subdir}/${page}`, resType: { content: "" } });
  return result?.content ?? "";
}

export async function saveWikiPage(subdir: string, page: string, data: { content: string }) {
  return post({ url: `/wikipage/${subdir}/${page}`, data });
}

export async function searchWiki(suchtext: string) {
  return post({
    url: "/wikipage/search",
    data: { suchtext },
    resType: { searchtext: "", matches: [{ pageName: "", line: "", text: "" }] },
  });
}

export async function deleteWikiPage(subdir: string, page: string) {
  return loeschen({ url: `/wikipage/${subdir}/${page}`, data: { data: "" } });
}

// Calendar
export async function calendarEventSources({
  start,
  end,
  options,
  isDarkMode,
}: {
  start: Date;
  end: Date;
  options?: TerminFilterOptions;
  isDarkMode: boolean;
}) {
  const segments = [`/fullcalendarevents.json?start=${start.toISOString()}&end=${end.toISOString()}&darkMode=${isDarkMode}`];
  if (options) {
    segments.push(`&options=${JSON.stringify(options)}`);
  }
  return get({ url: segments.join(), resType: [{} as TerminEvent] });
}

// History
export async function historyIdsFor(collection: string) {
  const result = await get({ url: `/history/${collection}` });
  return result as HistoryObjectOverview[];
}

export async function historyRowsFor(collection: string, id: string) {
  const result = await get({ url: `/history/${collection}/${encodeURIComponent(id)}`, resType: [{} as HistoryDBType] });
  return historyFromRawRows(result);
}

// Special

export async function openKassenzettel(konzert: Konzert) {
  const filename = `${konzert.kopf.titelMitPrefix} am ${konzert.startDatumUhrzeit.tagMonatJahrKompakt} (Kassenzettel).pdf`;
  window.open(`/pdf/kassenzettel/${encodeURIComponent(filename)}x?url=${encodeURIComponent(konzert.url!)}`);
}

export async function openVertrag(konzert: Konzert) {
  const filename = `${konzert.kopf.titelMitPrefix} am ${konzert.startDatumUhrzeit.tagMonatJahrKompakt} (Vertrag).pdf`;
  window.open(
    `/pdf/vertrag/${encodeURIComponent(filename)}?url=${encodeURIComponent(konzert.url!)}&language=${konzert.vertrag.sprache.toLowerCase()}`,
  );
}

export async function openAngebotRechnung(vermietung: Vermietung) {
  const filename = `${vermietung.kopf.titelMitPrefix} am ${vermietung.startDatumUhrzeit.tagMonatJahrKompakt} (${vermietung.art}).pdf`;
  window.open(`/pdf/vermietungAngebot/${encodeURIComponent(filename)}?url=${encodeURIComponent(vermietung.url!)}&art=${vermietung.art}`);
}

export async function imgFullsize(url: string) {
  const img = await get({ contentType: "other", url: `/upload/${url}`, resType: new Blob() });
  if (img) {
    showFile(img, url);
  }
}

export async function imgzipForVeranstaltung(konzert: Konzert) {
  const zip = await get({ contentType: "zip", url: `/imgzipForVeranstaltung/${konzert.url}`, resType: new Blob() });
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
