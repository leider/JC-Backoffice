import DatumUhrzeit from '../commons/DatumUhrzeit';

import reservixstore from './reservixstore';
import { loadSalesreports, Lineobject } from './htmlbridge';
import Salesreport from './salesreport';

function updateSalesreports(callback: Function): void {
  loadSalesreports(null, (err: Error | null, results: Lineobject[]) => {
    if (err || !results) {
      return callback(err);
    }
    const now = new Date();
    const resultsToSave = results.map(each => {
      each.datum = (each.datum as DatumUhrzeit).toJSDate;
      each.updated = now;
      return each;
    });

    return reservixstore.saveAll(resultsToSave, callback);
  });
}

export function salesreportFor(eventID: string, callback: Function): void {
  const emptySalesreport = new Salesreport({
    id: 'dummy',
    anzahl: 0,
    brutto: 0,
    netto: 0,
    updated: new Date(),
    datum: new Date()
  });
  if (!eventID) {
    return callback(emptySalesreport);
  }
  return reservixstore.getSalesreport(
    eventID,
    (err: Error | null, report: Salesreport) => {
      if (err || !report || report.istVeraltet()) {
        // neuer Request, speichern und dann nochmal laden!
        updateSalesreports((err1: Error | null) => {
          if (err1) {
            return callback(report || emptySalesreport);
          }
          return reservixstore.getSalesreport(
            eventID,
            (err2: Error | null, reportAktualisiert: Salesreport) => {
              return callback(reportAktualisiert || emptySalesreport);
            }
          );
        });
      } else {
        callback(report || emptySalesreport);
      }
    }
  );
}
