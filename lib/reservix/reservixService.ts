import DatumUhrzeit from '../commons/DatumUhrzeit';

import reservixstore from './reservixstore';
import { loadSalesreports, Lineobject } from './htmlbridge';
import Salesreport from './salesreport';

function updateSalesreports(callback: Function) {
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

    reservixstore.saveAll(resultsToSave, (err1: Error | null) => {
      if (err1) {
        return callback(err1);
      }
      callback();
    });
  });
}

export function salesreportFor(eventID: string, callback: Function) {
  if (!eventID) {
    return callback(new Salesreport());
  }
  reservixstore.getSalesreport(
    eventID,
    (err: Error | null, report: Salesreport) => {
      if (err || !report || report.istVeraltet()) {
        // neuer Request, speichern und dann nochmal laden!
        updateSalesreports((err1: Error | null) => {
          if (err1) {
            return callback(report || new Salesreport());
          }
          reservixstore.getSalesreport(
            eventID,
            (err2: Error | null, reportAktualisiert: Salesreport) => {
              return callback(reportAktualisiert || new Salesreport());
            }
          );
        });
      } else {
        callback(report || new Salesreport());
      }
    }
  );
}
