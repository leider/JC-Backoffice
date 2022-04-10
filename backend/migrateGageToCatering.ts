/* eslint no-console: 0 */
/*eslint no-process-exit: 0 */

import "./configure";
import veranstaltungenstore from "./lib/veranstaltungen/veranstaltungenstore";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import async from "async";

function loadVeranstaltungenMitGage(callback: Function) {
  veranstaltungenstore.alle((err: Error, alle: Veranstaltung[]) => {
    const mitGage = alle.filter((veranst) => veranst.kasse.ausgabeGageEUR || 0 > 0);
    callback(err, mitGage);
  });
}

const really = process.argv[2];
if (!really || really !== "really") {
  // only show the found data
  console.log('If you want to update the data, append "really" to the command line.');
  loadVeranstaltungenMitGage((err: Error, mitGage: Veranstaltung[]) => {
    console.log(
      "mitGage",
      mitGage.map((v) => ({ url: v.url, gage: v.kasse.ausgabeGageEUR, catering: v.kasse.ausgabeCateringEUR }))
    );
    /*eslint no-process-exit: 0 */
    process.exit(0);
  });
} else {
  loadVeranstaltungenMitGage((err: Error, mitGage: Veranstaltung[]) => {
    console.log(
      "mitGage",
      mitGage.map((v) => ({ url: v.url, gage: v.kasse.ausgabeGageEUR, catering: v.kasse.ausgabeCateringEUR }))
    );
    mitGage.forEach((v) => {
      v.kasse.ausgabeCateringEUR = v.kasse.ausgabeCateringEUR + v.kasse.ausgabeGageEUR;
    });
    async.forEach(mitGage, veranstaltungenstore.saveVeranstaltung, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      process.exit(0);
    });
  });
}
