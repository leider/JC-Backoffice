const fs = require("fs");
const path = require("path");
const copyfiles = require("copyfiles");

process.chdir(path.join(__dirname, ".."));
console.log(process.cwd());

const dest = "./.deploy-utils/runtime-deploy";
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest);
}

copyfiles(
  ["application/+(backend|batchjobs|shared)/**", dest],
  { all: true, up: 1 },
  () => {},
);

copyfiles(["application/.yarn/**", dest], { all: true, up: 1 }, () => {});

copyfiles(
  ["application/+(.yarnrc.yml|yarn.lock|package.json|start.js)", dest],
  { all: true, up: 1 },
  () => {},
);
