/* eslint no-console: 0 */

import "./configure";
import { Lineobject, loadSalesreports } from "./lib/reservix/htmlbridge";
import reservixstore from "./lib/reservix/reservixstore";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";

function load(datumString: string | null, results: Lineobject[], callback: Function): void {
  loadSalesreports(datumString, (err: Error | null, rawresults: Lineobject[]) => {
    if (rawresults && rawresults.length > 0) {
      const lastrow = rawresults[rawresults.length - 1];
      const lastrowAbsolute = results[results.length - 1];
      if (results && results.length > 0 && lastrow.id === lastrowAbsolute.id) {
        return callback(results);
      }
      const newDatumString = (lastrow.datum as DatumUhrzeit).tagMonatJahrKompakt;
      results = results.concat(rawresults);
      load(newDatumString, results, callback);
    } else {
      callback(results);
    }
  });
}

load("01.07.2019", [], async (results: Lineobject[]) => {
  const now = new Date();
  const resultsToSave = results.map((each) => {
    each.datum = (each.datum as DatumUhrzeit).toJSDate;
    each.updated = now;
    return each;
  });
  console.log(JSON.stringify(resultsToSave));
  try {
    await reservixstore.saveAll(resultsToSave);
  } catch (e) {
    console.log(e);
  }
  // eslint-disable-next-line no-process-exit
  process.exit();
});
