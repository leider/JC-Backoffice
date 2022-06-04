import Path from "path";
import fs from "fs/promises";
import Fs from "fs/promises";
import childProcess from "child_process";
import util from "util";
import conf from "../commons/simpleConfigure";

const exec = util.promisify(childProcess.exec);

let workTree = conf.get("wikipath") as string;

let gitCommands: string[] = [];

async function init() {
  if (workTree) {
    try {
      workTree = await Fs.realpath(workTree);
    } catch (e) {
      throw new Error(`Repository path does not exist: ${workTree}`);
    }
    const gitDir = Path.join(workTree, ".git");
    try {
      await fs.stat(gitDir);
    } catch (e) {
      throw new Error(`Repository path is not initialized: ${workTree}`);
    }
    gitCommands = [`--git-dir=${gitDir}`, `--work-tree=${workTree}`];
    // run a smoke test of git and the repo:
    try {
      await exec("git log -1 --oneline ", { cwd: workTree });
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (/fatal: your current branch 'master' does not have any commits yet/.test(e.message)) {
        throw new Error(`Please add an initial commit to the repository: ${workTree}`);
      }
      throw new Error(`${e.message} in ${workTree}`);
    }
  }
}
init();

async function gitExec(commands: string[]) {
  const { stdout } = await exec(`git ${gitCommands.concat(commands).join(" ")}`, {
    cwd: workTree,
  });
  return stdout;
}

export default { command: gitExec };
