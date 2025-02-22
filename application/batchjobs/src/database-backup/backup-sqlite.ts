/* eslint-disable no-console, no-process-exit */
import "jc-backend/configure.js";
import axios from "axios";
import conf from "jc-shared/commons/simpleConfigure.js";

console.log("Starting database backup...");
const myArgs = process.argv.slice(2);

axios
  .get(`${conf.publicUrlPrefix}/batches/backup-database?path=${encodeURIComponent(myArgs.length > 0 ? myArgs[0] : "")}`, {
    headers: { Authorization: "Bearer " + conf.bearer },
  })
  .then((result) => {
    console.log("Terminating backup..." + result.data.status);
  })
  .catch((err) => {
    console.error("Error during backup...");
    console.error(err.message);
  })
  .finally(() => {
    process.exit();
  });
