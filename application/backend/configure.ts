import conf, { SimpleConfigure } from "jc-shared/commons/simpleConfigure.js";
import path, { dirname } from "path";
import fs from "fs";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

function createConfiguration(): SimpleConfigure {
  const confDir = process.env.CONF || "config";

  let configdir = path.join(__dirname, `../../${confDir}/`);
  try {
    // eslint-disable-next-line no-sync
    fs.statSync(configdir);
  } catch {
    configdir = path.join(__dirname, "../dummy-config/");
  }

  function addFiles(files: string[]): void {
    if (!files) {
      return;
    }
    files.forEach((file) => {
      // eslint-disable-next-line no-sync
      if (fs.existsSync(file)) {
        // eslint-disable-next-line no-sync
        const theFile = fs.readFileSync(file, { encoding: "utf-8" });
        conf.setBaseDirectory(__dirname);
        conf.addProperties(JSON.parse(theFile));
      }
    });
  }

  // then, add properties from config files:
  const files = ["mailsender-config.json", "passwordSalt.json", "server-config.json"];

  addFiles(files.map((file) => configdir + file));

  return conf;
}

createConfiguration();
