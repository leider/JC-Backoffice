import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Salesreport from "jc-shared/veranstaltung/salesreport";

import reservixstore from "./reservixstore";
import { loadSalesreports, Lineobject } from "./htmlbridge";

async function updateSalesreports() {
  const results: Lineobject[] = await new Promise((resolve, reject) => {
    loadSalesreports(null, (err: Error | null, results: Lineobject[]) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
  const now = new Date();
  const resultsToSave = results.map((each) => {
    each.datum = (each.datum as DatumUhrzeit).toJSDate;
    each.updated = now;
    return each;
  });

  return reservixstore.saveAll(resultsToSave);
}

export async function salesreportFor(eventID?: string) {
  const emptySalesreport = new Salesreport({
    id: "dummy",
    anzahl: 0,
    brutto: 0,
    netto: 0,
    updated: new Date(),
    datum: new Date(),
  });
  if (!eventID) {
    return emptySalesreport;
  }
  const report = await reservixstore.getSalesreport(eventID);
  if (!report || report.istVeraltet()) {
    // neuer Request, speichern und dann nochmal laden!
    const reportUpd = await updateSalesreports();
    if (!reportUpd) {
      return emptySalesreport;
    }
    const reportAktualisiert = await reservixstore.getSalesreport(eventID);
    return reportAktualisiert || emptySalesreport;
  } else {
    return report || emptySalesreport;
  }
}
