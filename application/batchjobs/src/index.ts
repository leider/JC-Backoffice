/* eslint-disable no-console, no-process-exit */
import "jc-backend/configure.js";
import "jc-backend/initWinston.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import sendMailsNightly from "./sendMailsNightly.js";
import { informAdmin, JobType } from "./sendMailToAdmin.js";
import map from "lodash/map.js";

function closeAndExit(err?: Error): void {
  if (err) {
    console.error("Error in nightjob...");
    console.error(err.message);
  } else {
    console.log("Terminating nightjob...");
  }
  process.exit();
}

console.log("Starting nightjob...");

const now = new DatumUhrzeit();

async function run() {
  try {
    const results = await Promise.all([
      sendMailsNightly.loadRulesAndProcess(now),
      sendMailsNightly.checkFluegel(now),
      sendMailsNightly.checkFotograf(now),
      sendMailsNightly.checkPressetexte(now),
      sendMailsNightly.checkKasse(now),
      sendMailsNightly.remindForProgrammheft(now),
      sendMailsNightly.checkStaff(now),
      sendMailsNightly.checkBar(now),
    ]);

    const jobtypes: JobType[] = ["Presse", "Fluegel", "Photo", "TextFehlt", "Kasse", "Programmheft", "Staff", "Bar"];

    const typedResults = map(results, (jobResult, index) => ({ type: jobtypes[index], jobResult }));

    await informAdmin(typedResults);
    closeAndExit();
  } catch (e) {
    closeAndExit(e as Error);
  }
}
run();
