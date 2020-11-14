import store from "./veranstaltungenstore";
import { salesreportFor } from "../reservix/reservixService";
import Veranstaltung from "./object/veranstaltung";
import Salesreport from "../reservix/salesreport";

function getVeranstaltungMitReservix(url: string, callback: Function): void {
  store.getVeranstaltung(url, (err: Error | null, veranstaltung?: Veranstaltung) => {
    if (err) {
      return callback(err);
    }
    if (!veranstaltung) {
      return callback(null, null);
    }
    return salesreportFor(veranstaltung.reservixID, (salesreport?: Salesreport) => {
      veranstaltung.associateSalesreport(salesreport);
      callback(null, veranstaltung);
    });
  });
}

export default {
  getVeranstaltungMitReservix,
};
