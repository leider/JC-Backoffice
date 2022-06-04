/* eslint-disable @typescript-eslint/no-explicit-any */

import superagent from "superagent";
import { Cheerio, CheerioAPI, load } from "cheerio";

import fieldHelpers from "jc-shared/commons/fieldHelpers";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";

import conf from "../commons/simpleConfigure";

const baseURL = "https://system.reservix.de";

const loginURL = baseURL + "/off/login_check.php?deeplink=0&id=" + conf.get("reservix-deeplink");
const username = conf.get("reservix-username");
const tablepositions = {
  datum: 0,
  uhrzeit: 1,
  event: 2,
  gesamtkontingent: 3,
  einzeltickets: 4,
  abotickets: 5,
  gesamt: 6,
  freikarten: 7,
  belegungProzent: 8,
  bezahlt: 14,
  netto: 15,
  brutto: 16,
};

function prepareInputsForPost(forminputs: Cheerio<any>, $: CheerioAPI): { [p: string]: string } {
  return forminputs
    .filter((i: any, e: any) => !!$(e).val())
    .serializeArray()
    .reduce((acc: { [x: string]: string }, curr: { name: string; value: string }) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {});
}

function sanityCheck(headersAndLines: { headers: { row: string[] }[]; lines: { row: string[] }[] }) {
  function expect(value: boolean, detail: string) {
    if (!value) {
      throw new Error(`format of reservix table changed! - ${detail}`);
    }
  }

  const headers = headersAndLines.headers;
  const lines = headersAndLines.lines;
  expect(headers.length >= 2, `needs to have at least two header lines, but has: ${headers.length}`);
  expect(headers[0].row.length === 7, `first header line should have 7, but has: ${headers[0].row.length}`);
  expect(headers[1].row.length === 13, `second header line should have 13, but has: ${headers[1].row.length}`);
  if (lines.length > 0) {
    expect(lines[0].row.length === 18, `data line should have 18, but has: ${lines[0].row.length}`);
  }
}

function parseTable(headersAndLines: { headers: { row: string[] }[]; lines: { row: string[] }[] }) {
  function moneyStringToFloat(string: string): number {
    // remove € and change from german string to float
    return fieldHelpers.parseNumberWithCurrentLocale(string.replace(" €", ""));
  }

  sanityCheck(headersAndLines); // throws in case of unexpected content
  return headersAndLines.lines
    .filter((each) => each.row.length === 18)
    .map((each) => {
      const row = each.row;
      const match = row[tablepositions.event].match(/\((\w+)\)$/);
      return {
        datum: DatumUhrzeit.forReservixString(row[tablepositions.datum], row[tablepositions.uhrzeit]),
        id: match ? match[1] : "", // search event id between (...)
        anzahl: parseInt(row[tablepositions.gesamt], 10) + parseInt(row[tablepositions.freikarten], 10),
        netto: moneyStringToFloat(row[tablepositions.netto]),
        brutto: moneyStringToFloat(row[tablepositions.brutto]),
      };
    });
}

function extractResultTableLines(htmlString: string) {
  const $ = load(htmlString);

  const asfields = (index: number, element: any): { row: string[] } => ({
    row: $(element)
      .find("td")
      .map((index1, element1) => $(element1).text())
      .toArray() as unknown as string[],
  });
  const headers = $(".tablelines tr").not(".rxrow").map(asfields).toArray() as unknown as { row: string[] }[];
  const lines = $(".tablelines .rxrow").map(asfields).toArray() as unknown as { row: string[] }[];
  return parseTable({ headers, lines });
}

async function openAuswertungPage(location: string, optionalDateString?: string) {
  const resp = await superagent.get(location);
  const $ = load(resp.text);
  const logoutURL = $("#page_header_logout a").attr("href");
  if (optionalDateString) {
    $("#id_eventdatumvon").val(optionalDateString);
  }
  const postRes = await superagent
    .post(baseURL + "/sales/" + $("#searchForm").attr("action"))
    .type("form")
    .send(prepareInputsForPost($("#searchForm :input"), $));
  await superagent.get(baseURL + logoutURL);
  // logout then parse
  return extractResultTableLines(postRes.text);
}

async function openVerwaltungPage(location: string, optionalDateString?: string) {
  const resp = await superagent.get(location);
  const $ = load(resp.text);
  const auswertungUrl = $("#content ul li a")
    .filter(
      (index, element) =>
        !!$(element)
          .html()
          ?.match(/Detailauswertung/)
    )
    .attr("href");

  return openAuswertungPage(baseURL + auswertungUrl, optionalDateString);
}

async function openWelcomePage(location: string, optionalDateString?: string) {
  const resp = await superagent.get(location);
  const $ = load(resp.text);
  const verwaltungUrl = $("#page_header ul li a")
    .filter(
      (index, element) =>
        !!$(element)
          .html()
          ?.match(/Verwaltung/)
    )
    .attr("href");

  return openVerwaltungPage(baseURL + verwaltungUrl, optionalDateString);
}

export interface Lineobject {
  datum?: DatumUhrzeit | Date;
  updated?: Date;
  id: string;
  anzahl: number;
  netto: number;
  brutto: number;
}

export async function loadSalesreports(optionalDateString?: string): Promise<Lineobject[]> {
  const res = await superagent.get(loginURL);
  const $ = load(res.text);
  $("#id_mitarbeiterpw").val(username as string);
  const inputs = prepareInputsForPost($("#login input"), $);
  const url = $("#login").attr("action");
  if (url === undefined) {
    throw new Error("Problem beim Laden von Reservix");
  }
  const postRes = await superagent.post(url).type("form").send(inputs);
  return openWelcomePage(postRes.redirects[0], optionalDateString);
}
