/* eslint-disable no-console, no-process-exit */
import "jc-backend/configure.js";
import axios from "axios";
import conf from "jc-shared/commons/simpleConfigure.js";

console.log("Starting nightjob...");

axios
  .get(`${conf.publicUrlPrefix}/batches/nightly-mails`, { headers: { Authorization: "Bearer " + conf.bearer } })
  .then((result) => {
    console.log("Terminating nightjob..." + result.data.status);
  })
  .catch((err) => {
    console.error("Error in nightjob...");
    console.error(err.message);
  })
  .finally(() => {
    process.exit();
  });
