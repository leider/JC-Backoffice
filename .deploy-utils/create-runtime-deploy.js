const fs = require("fs");
const path = require("path");
const copyfiles = require("copyfiles");
const { rimraf } = require("rimraf");
const childProcess = require("child_process");

process.chdir(path.join(__dirname, ".."));
console.log("CWD:", process.cwd());

const dest = path.join(process.cwd(), "../JC-Backoffice-dist/");
console.log("copying to", dest);
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest);
}

copyfiles(
  ["application/+(backend|batchjobs|shared)/**", dest],
  { all: true },
  () => {
    copyfiles(["application/.yarn/**", dest], { all: true }, () => {
      copyfiles(
        ["application/+(.yarnrc.yml|yarn.lock|package.json|start.js)", dest],
        { all: true },
        () => {
          process.chdir(path.join(dest, "application"));
          console.log("CWD:", process.cwd());
          rimraf.sync("node_modules", { glob: true });
          rimraf.sync("./**/*.ts", { glob: true });
          rimraf.sync("./**/*.log", { glob: true });
          rimraf.sync("./**/*.test.*", { glob: true });
          childProcess.execSync("git add --all");
          console.log("SUCCESS!");
        },
      );
    });
  },
);
