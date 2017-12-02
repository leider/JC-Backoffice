const R = require('ramda');

const beans = require('simple-configure').get('beans');
const store = beans.get('veranstaltungenstore');
const reservixService = beans.get('reservixService');

function getVeranstaltungMitReservix(url, callback) {
  store.getVeranstaltung(url, (err, veranstaltung) => {
    if (err) { return callback(err); }
    if (!veranstaltung) {
      return callback(null, null);
    }
    reservixService.salesreportFor(veranstaltung.reservixID(), salesreport => {
      veranstaltung.associateSalesreport(salesreport);
      callback(null, veranstaltung);
    });
  });

}

module.exports = {
  getVeranstaltungMitReservix,

  alleBildNamen: function alleBildNamen(callback) {
    store.alle((err, veranstaltungen) => {
      const result = R.uniq(R.flatten(veranstaltungen.map(v => v.presse()).map(p => p.image())));
      callback(err, result.sort());
    });
  }
};
