/* eslint-disable no-process-exit */
/* eslint no-console: 0 */

import "./configure";
import store from "./lib/veranstaltungen/veranstaltungenstore";
import Veranstaltung from "./lib/veranstaltungen/object/veranstaltung";
import async from "async";

store.alle((err: Error | null, veranstaltungen: Veranstaltung[]) => {
  if (err) {
    console.log(err);
    process.exit();
  }
  veranstaltungen.forEach((v) => {
    v.url = v.initializedUrl;
  });
  async.each(veranstaltungen, store.saveVeranstaltung, (err) => {
    if (err) {
      console.log(err);
    }
    console.log("All updated");
    process.exit();
  });
});
