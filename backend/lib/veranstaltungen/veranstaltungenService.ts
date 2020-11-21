import store from "./veranstaltungenstore";
import { salesreportFor } from "../reservix/reservixService";
import Veranstaltung from "../../../shared/veranstaltung//veranstaltung";
import Salesreport from "../../../shared/veranstaltung/salesreport";
import express from "express";

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

function filterUnbestaetigteFuerJedermann(veranstaltungen: Veranstaltung[], res: express.Response): Veranstaltung[] {
  if (res.locals.accessrights.isBookingTeam()) {
    return veranstaltungen;
  }
  return veranstaltungen.filter((v) => v.kopf.confirmed);
}

export default {
  getVeranstaltungMitReservix,
  filterUnbestaetigteFuerJedermann,
};
