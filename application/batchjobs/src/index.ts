/* eslint-disable no-console, no-process-exit */
import "jc-backend/configure.js";
import "jc-backend/initWinston.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import sendMailsNightly from "./sendMailsNightly.js";
import { informAdmin, JobType } from "./sendMailToAdmin.js";

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

//const now = new DatumUhrzeit();
const now = DatumUhrzeit.forGermanString("01.12.2024")!;

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

    const typedResults = results.map((jobResult, index) => ({ type: jobtypes[index], jobResult }));

    await Promise.all(typedResults.map((res) => informAdmin([res])));
    closeAndExit();
  } catch (e) {
    closeAndExit(e as Error);
  }
}
run();
