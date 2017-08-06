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
  getVeranstaltungMitReservix
};
