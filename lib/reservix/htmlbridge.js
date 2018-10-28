const request = require('request').defaults({jar: true});

const baseURL = 'https://system.reservix.de';
const loginURL = baseURL + '/off/login_check.php?deeplink=0&id=9951f732bdc88947bd751c739d183cd6e0137a1fe29378e4e6d370d7727a9e55cda53b5a6c66c9a6';
const username = 'JazzBabe';
const cheerio = require('cheerio');
const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');

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

function prepareInputsForPost(forminputs, $) {
  return forminputs
    .filter(function () {return !!$(this).val();})
    .serializeArray()
    .reduce((acc, curr) => {
      acc[curr.name] = curr.value;
      return acc;
    }, {});
}

function parseTable(headersAndLines, callback) {
  function moneyStringToFloat(string) { // remove € and change from german string to float
    return fieldHelpers.parseNumberWithCurrentLocale(string.replace(' €', ''));
  }

  // check headers TODO
  const lineobjects = headersAndLines.lines
                                     .filter(each => each.row.length === 20)
                                     .map(each => {
                                       const row = each.row;
                                       return {
                                         datum: fieldHelpers.parseToMomentUsingDefaultTimezone(row[tablepositions.datum], row[tablepositions.uhrzeit]),
                                         id: row[tablepositions.event].match(/\((\w+)\)$/)[1], // search event id between (...)
                                         anzahl: parseInt(row[tablepositions.gesamt], 10) + parseInt(row[tablepositions.freikarten], 10),
                                         netto: moneyStringToFloat(row[tablepositions.netto]),
                                         brutto: moneyStringToFloat(row[tablepositions.brutto])
                                       };
                                     });
  callback(null, lineobjects);
}

function extractResultTableLines(htmlString, callback) {
  const $ = cheerio.load(htmlString);
  const headers = $('.tablelines tr').not('.rxrow').map(function () {
    return {
      row: $(this).find('td').map(function () {
        return $(this).text();
      }).toArray()
    };
  }).toArray();
  const lines = $('.tablelines .rxrow').map(function () {
    return {
      row: $(this).find('td').map(function () {
        return $(this).text();
      }).toArray()
    };
  }).toArray();
  parseTable({headers, lines}, callback);
}

function openAuswertungPage(location, optionalDateString, callback) {
  request(location, (err, resp, body) => {
    if (err) { return callback(err); }
    const $ = cheerio.load(body.toString());
    const logoutURL = $('#page_header_logout a').attr('href');
    if (optionalDateString) {
      $('#id_eventdatumvon').val(optionalDateString);
    }

    request.post({
      url: baseURL + '/sales/' + $('#searchForm').attr('action'),
      formData: prepareInputsForPost($('#searchForm :input'), $)
    }, (err1, resp1, body1) => {
      if (err1) { return callback(err1); }
      request(baseURL + logoutURL, () => { // logout then parse
        extractResultTableLines(body1.toString(), callback);
      });
    });

  });
}

function openVerwaltungPage(location, optionalDateString, callback) {
  request(location, (err, resp, body) => {
    if (err) { return callback(err); }
    const $ = cheerio.load(body.toString());
    const auswertungUrl = $('#content ul li a')
      .filter(function () {return $(this).html().match(/Detailauswertung/);})
      .attr('href');

    openAuswertungPage(baseURL + auswertungUrl, optionalDateString, callback);
  });
}

function openWelcomePage(location, optionalDateString, callback) {
  request(location, (err, resp, body) => {
    if (err) { return callback(err); }
    const $ = cheerio.load(body.toString());
    const verwaltungUrl = $('#page_header_middle ul li a')
      .filter(function () {return $(this).html().match(/Verwaltung/);})
      .attr('href');

    openVerwaltungPage(baseURL + verwaltungUrl, optionalDateString, callback);
  });
}

function loadSalesreports(optionalDateString, callback) {
  request(loginURL, (err, resp, body) => {
    if (err) { return callback(err); }
    const $ = cheerio.load(body.toString());
    $('#id_mitarbeiterpw').val(username);
    const inputs = prepareInputsForPost($('#login input'), $);
    request.post({url: $('#login').attr('action'), formData: inputs}, (err1, resp1) => {
      if (err1) { return callback(err1); }
      openWelcomePage(baseURL + resp1.headers.location, optionalDateString, callback);
    });
  });
}

module.exports = {
  loadSalesreports
};

