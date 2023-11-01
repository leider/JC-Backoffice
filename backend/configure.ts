const __dirname = new URL(".", import.meta.url).pathname;
process.chdir(__dirname);
import conf, { SimpleConfigure } from "../shared/commons/simpleConfigure.js";
import path from "path";
import fs from "fs";

function createConfiguration(): SimpleConfigure {
  let confDir = "config";
  const myArgs = process.argv.slice(2);
  if (myArgs.length > 0) {
    confDir = myArgs[0];
  }

  let configdir = path.join(__dirname, `../${confDir}/`);
  try {
    // eslint-disable-next-line no-sync
    fs.statSync(configdir);
  } catch (e) {
    configdir = path.join(__dirname, "../dummy-config/");
  }

  // first, set the default values
  conf.addProperties({
    port: "1969",
    emaildomainname: "localhost",
  });

  function addFiles(files: string[]): void {
    if (!files) {
      return;
    }
    files.forEach((file) => {
      // eslint-disable-next-line no-sync
      if (fs.existsSync(file)) {
        // eslint-disable-next-line no-sync
        const theFile = fs.readFileSync(file, { encoding: "utf-8" });
        conf.addProperties(JSON.parse(theFile));
      }
    });
  }

  // then, add properties from config files:
  const files = ["mailsender-config.json", "mongo-config.json", "passwordSalt.json", "server-config.json"];

  addFiles(files.map((file) => configdir + file));

  return conf;
}

createConfiguration();
