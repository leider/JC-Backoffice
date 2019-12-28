import path from 'path';
import fs from 'fs';

import store from './veranstaltungenstore';
import { salesreportFor } from '../reservix/reservixService';
import Veranstaltung from './object/veranstaltung';
import Salesreport from '../reservix/salesreport';

const uploadDir = path.join(__dirname, '../../public/upload');

function getVeranstaltungMitReservix(url: string, callback: Function) {
  store.getVeranstaltung(
    url,
    (err: Error | null, veranstaltung?: Veranstaltung) => {
      if (err) {
        return callback(err);
      }
      if (!veranstaltung) {
        return callback(null, null);
      }
      salesreportFor(
        veranstaltung.reservixID(),
        (salesreport?: Salesreport) => {
          veranstaltung.associateSalesreport(salesreport);
          callback(null, veranstaltung);
        }
      );
    }
  );
}

export default {
  getVeranstaltungMitReservix,

  alleBildNamen: function alleBildNamen(callback: Function) {
    fs.readdir(uploadDir, (err, files) => {
      callback(err, files.sort());
    });
  }
};
