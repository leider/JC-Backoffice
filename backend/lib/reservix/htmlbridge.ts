/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any */
import superagent, { Response } from "superagent";
import cheerio from "cheerio";

import fieldHelpers from "../../../shared/commons/fieldHelpers";
import DatumUhrzeit from "../../../shared/commons/DatumUhrzeit";

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
  bezahlt: 16,
  netto: 17,
  brutto: 18,
};

function prepareInputsForPost(forminputs: any, $: cheerio.Selector): any {
  return forminputs
    .filter(function () {
      // @ts-ignore
      return !!$(this).val();
    })
    .serializeArray()
    .reduce((acc: { [x: string]: string }, curr: { name: string; value: string }) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {});
}

function parseTable(headersAndLines: { headers: Array<any>; lines: Array<any> }, callback: Function): void {
  function moneyStringToFloat(string: string): number {
    // remove € and change from german string to float
    return fieldHelpers.parseNumberWithCurrentLocale(string.replace(" €", ""));
  }

  // check headers TODO
  const lineobjects = headersAndLines.lines
    .filter((each) => each.row.length === 20)
    .map((each) => {
      const row = each.row;
      return {
        datum: DatumUhrzeit.forReservixString(row[tablepositions.datum], row[tablepositions.uhrzeit]),
        id: row[tablepositions.event].match(/\((\w+)\)$/)[1], // search event id between (...)
        anzahl: parseInt(row[tablepositions.gesamt], 10) + parseInt(row[tablepositions.freikarten], 10),
        netto: moneyStringToFloat(row[tablepositions.netto]),
        brutto: moneyStringToFloat(row[tablepositions.brutto]),
      };
    });
  callback(null, lineobjects);
}

function extractResultTableLines(htmlString: string, callback: Function): void {
  const $ = cheerio.load(htmlString);
  function asFields(): any[] {
    return {
      // @ts-ignore
      row: $(this)
        .find("td")
        .map(function () {
          // @ts-ignore
          return $(this).text();
        })
        .toArray(),
    };
  }
  const headers = $(".tablelines tr").not(".rxrow").map(asFields).toArray();
  const lines = $(".tablelines .rxrow").map(asFields).toArray();
  parseTable({ headers, lines }, callback);
}

function openAuswertungPage(location: string, optionalDateString: string | null, callback: Function): void {
  superagent.get(location, (err: any, resp: Response) => {
    if (err) {
      return callback(err);
    }
    const $ = cheerio.load(resp.text);
    const logoutURL = $("#page_header_logout a").attr("href");
    if (optionalDateString) {
      $("#id_eventdatumvon").val(optionalDateString);
    }
    superagent
      .post(baseURL + "/sales/" + $("#searchForm").attr("action"))
      .type("form")
      .send(prepareInputsForPost($("#searchForm :input"), $))
      .then((resp1: Response) => {
        superagent.get(baseURL + logoutURL, () => {
          // logout then parse
          extractResultTableLines(resp1.text, callback);
        });
      });
  });
}

function openVerwaltungPage(location: string, optionalDateString: string | null, callback: Function): void {
  superagent.get(location, (err: any, resp: Response) => {
    if (err) {
      return callback(err);
    }
    const $ = cheerio.load(resp.text);
    const auswertungUrl = $("#content ul li a")
      // @ts-ignore
      .filter(function () {
        // @ts-ignore
        return $(this)
          .html()
          .match(/Detailauswertung/);
      })
      .attr("href");

    return openAuswertungPage(baseURL + auswertungUrl, optionalDateString, callback);
  });
}

function openWelcomePage(location: string, optionalDateString: string | null, callback: Function): void {
  superagent.get(location, (err: any, resp: Response) => {
    if (err) {
      return callback(err);
    }
    const $ = cheerio.load(resp.text);
    const verwaltungUrl = $("#page_header ul li a")
      // @ts-ignore
      .filter(function () {
        // @ts-ignore
        return $(this)
          .html()
          .match(/Verwaltung/);
      })
      .attr("href");

    return openVerwaltungPage(baseURL + verwaltungUrl, optionalDateString, callback);
  });
}

export interface Lineobject {
  datum: DatumUhrzeit | Date;
  updated: Date;
  id: string;
  anzahl: number;
  netto: number;
  brutto: number;
}

export function loadSalesreports(optionalDateString: string | null, callback: Function): void {
  superagent.get(loginURL, (err: any, res: Response) => {
    if (err) {
      return callback(err);
    }
    const $ = cheerio.load(res.text);
    $("#id_mitarbeiterpw").val(username as string);
    const inputs = prepareInputsForPost($("#login input"), $);
    const url = $("#login").attr("action");
    if (url === undefined) {
      return callback("Problem beim LAden von REservix");
    }
    return superagent
      .post(url)
      .type("form")
      .send(inputs)
      .then((res1: Response) => {
        openWelcomePage(
          // @ts-ignore
          res1.redirects[0],
          optionalDateString,
          callback
        );
      });
  });
}
