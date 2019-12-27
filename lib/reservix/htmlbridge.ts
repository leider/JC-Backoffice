import request from 'request';
const requester = request.defaults({ jar: true });
import cheerio from 'cheerio';

const conf = require('simple-configure');
const baseURL = 'https://system.reservix.de';

const loginURL =
  baseURL +
  '/off/login_check.php?deeplink=0&id=' +
  conf.get('reservix-deeplink');
const username = conf.get('reservix-username');
import fieldHelpers from '../commons/fieldHelpers';
import DatumUhrzeit from '../commons/DatumUhrzeit';

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
  brutto: 18
};

function prepareInputsForPost(forminputs: any, $: CheerioStatic) {
  return forminputs
    .filter(function() {
      // @ts-ignore
      return !!$(this).val();
    })
    .serializeArray()
    .reduce(
      (acc: { [x: string]: string }, curr: { name: string; value: string }) => {
        acc[curr.name] = curr.value;
        return acc;
      },
      {}
    );
}

function parseTable(
  headersAndLines: { headers: Array<any>; lines: Array<any> },
  callback: Function
) {
  function moneyStringToFloat(string: string) {
    // remove € and change from german string to float
    return fieldHelpers.parseNumberWithCurrentLocale(string.replace(' €', ''));
  }

  // check headers TODO
  const lineobjects = headersAndLines.lines
    .filter(each => each.row.length === 20)
    .map(each => {
      const row = each.row;
      return {
        datum: DatumUhrzeit.forReservixString(
          row[tablepositions.datum],
          row[tablepositions.uhrzeit]
        ),
        id: row[tablepositions.event].match(/\((\w+)\)$/)[1], // search event id between (...)
        anzahl:
          parseInt(row[tablepositions.gesamt], 10) +
          parseInt(row[tablepositions.freikarten], 10),
        netto: moneyStringToFloat(row[tablepositions.netto]),
        brutto: moneyStringToFloat(row[tablepositions.brutto])
      };
    });
  callback(null, lineobjects);
}

function extractResultTableLines(htmlString: string, callback: Function) {
  const $ = cheerio.load(htmlString);
  function asFields() {
    return {
      // @ts-ignore
      row: $(this)
        .find('td')
        .map(function() {
          // @ts-ignore
          return $(this).text();
        })
        .toArray()
    };
  }
  const headers = $('.tablelines tr')
    .not('.rxrow')
    .map(asFields)
    .toArray();
  const lines = $('.tablelines .rxrow')
    .map(asFields)
    .toArray();
  parseTable({ headers, lines }, callback);
}

function openAuswertungPage(
  location: string,
  optionalDateString: string | null,
  callback: Function
) {
  request(location, (err, resp, body) => {
    if (err) {
      return callback(err);
    }
    const $ = cheerio.load(body.toString());
    const logoutURL = $('#page_header_logout a').attr('href');
    if (optionalDateString) {
      $('#id_eventdatumvon').val(optionalDateString);
    }

    request.post(
      {
        url: baseURL + '/sales/' + $('#searchForm').attr('action'),
        formData: prepareInputsForPost($('#searchForm :input'), $)
      },
      (err1, resp1, body1) => {
        if (err1) {
          return callback(err1);
        }
        request(baseURL + logoutURL, () => {
          // logout then parse
          extractResultTableLines(body1.toString(), callback);
        });
      }
    );
  });
}

function openVerwaltungPage(
  location: string,
  optionalDateString: string | null,
  callback: Function
) {
  request(location, (err, resp, body) => {
    if (err) {
      return callback(err);
    }
    const $ = cheerio.load(body.toString());
    const auswertungUrl = $('#content ul li a')
      // @ts-ignore
      .filter(function() {
        // @ts-ignore
        return $(this)
          .html()
          .match(/Detailauswertung/);
      })
      .attr('href');

    openAuswertungPage(baseURL + auswertungUrl, optionalDateString, callback);
  });
}

function openWelcomePage(
  location: string,
  optionalDateString: string | null,
  callback: Function
) {
  request(location, (err, resp, body) => {
    if (err) {
      return callback(err);
    }
    const $ = cheerio.load(body.toString());
    const verwaltungUrl = $('#page_header_middle ul li a')
      // @ts-ignore
      .filter(function() {
        // @ts-ignore
        return $(this)
          .html()
          .match(/Verwaltung/);
      })
      .attr('href');

    openVerwaltungPage(baseURL + verwaltungUrl, optionalDateString, callback);
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

export function loadSalesreports(
  optionalDateString: string | null,
  callback: Function
) {
  requester(loginURL, (err, resp, body) => {
    if (err) {
      return callback(err);
    }
    const $ = cheerio.load(body.toString());
    $('#id_mitarbeiterpw').val(username);
    const inputs = prepareInputsForPost($('#login input'), $);
    request.post(
      // @ts-ignore
      { url: $('#login').attr('action'), formData: inputs },
      (err1: Error | null, resp1: Response) => {
        if (err1) {
          return callback(err1);
        }
        openWelcomePage(
          // @ts-ignore
          baseURL + resp1.headers.location,
          optionalDateString,
          callback
        );
      }
    );
  });
}
