const fs = require('fs');
const beans = require('simple-configure').get('beans');
const store = beans.get('veranstaltungenstore');
const reservixService = beans.get('reservixService');
const path = require('path');
const uploadDir = path.join(__dirname, '../../public/upload');

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
    fs.readdir(uploadDir, (err, files) => {
      callback(err, files.sort());
    });
  }
};
