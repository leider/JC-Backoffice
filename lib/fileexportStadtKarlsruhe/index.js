/* eslint camelcase: 0*/

const conf = require('simple-configure');
const beans = conf.get('beans');

const Renderer = beans.get('renderer');
const store = beans.get('veranstaltungenstore');

const veranstalter = conf.get('veranstalterIDStadtKarlsruhe');

const ortIds = {
  'Alte Hackerei': 0,
  Jubez: 28,
  Substage: 0,
  Tempel: 9030,
  Tollhaus: 0,
  ZKM_Kubus: 0,
  ZKM_Lounge: 0,
  'Sandkorn Theater': 0,
  'Badischen Kunstverein': 21421,
  'Badischen Staatstheater': 6075,
  'Ev. Stadtkirche Durlach': 72931
};

const firstLine =
  'id;veranstalter;freitext;title;beginn;beschreibung;url;ort;pool_unitref;bild';

function csvLineFor(veranstaltung) {
  const presse = veranstaltung.presse();
  const kopf = veranstaltung.kopf();
  const titel = kopf.titel();
  const beginn = veranstaltung.startDatumUhrzeit().mitUhrzeitNumerisch();
  const freitext = Renderer.render(presse.text());
  const beschreibung = 'beschreibung';
  const url = presse.fullyQualifiedJazzclubURL();
  const idVonOrt = ortIds[kopf.ort()];
  const bild = presse.imageURLpure();
  return (
    ';' +
    veranstalter +
    ';' +
    freitext +
    ';' +
    titel +
    ';' +
    beginn +
    ';' +
    beschreibung +
    ';' +
    url +
    ';' +
    idVonOrt +
    ';1444;' +
    bild +
    '\r\n'
  );
}

function send(url, callback) {
  store.getVeranstaltung(url, (err, veranstaltung) => {
    callback(err, firstLine + '\r\n' + csvLineFor(veranstaltung));
  });
}

module.exports = {
  send
};
