import gitExec from "./gitExec";
import conf from "../commons/simpleConfigure";
const workTree = conf.get("wikipath");

function dataToLines(data?: string): string[] {
  return data ? data.split("\n").filter((v) => v !== "") : [];
}

function esc(arg: string): string {
  // to secure command line execution
  return `'${arg}'`;
}

async function commit(path: string, message: string, author: string) {
  return gitExec.command(["commit", `--author=${esc(author)}`, "-m", esc(message), esc(path)]);
}

export default {
  absPath: function absPath(path: string): string {
    return workTree + "/" + path;
  },

  readFile: async function readFile(path: string, version: string) {
    return gitExec.command(["show", version + ":" + esc(path)]);
  },

  add: async function add(path: string, message: string, author: string) {
    await gitExec.command(["add", esc(path)]);
    return commit(path, message, author);
  },

  rm: async function rm(path: string, message: string, author: string) {
    await gitExec.command(["rm", esc(path)]);
    return commit(path, message, author);
  },

  grep: async function grep(pattern: string) {
    try {
      const data = await gitExec.command(["grep", "--no-color", "-F", "-n", "-i", "-I", esc(pattern)]);
      const result = data ? data.split("\n") : [];
      // Search in the file names
      const data1 = await gitExec.command(["ls-files", `*${esc(pattern)}*.md`]);
      if (data1) {
        data1.split("\n").forEach((name) => result.push(name));
      }
      return result;
    } catch (e: any) {
      if (e.message && e.message.split("\n").length < 3) {
        return [];
      }
      throw e;
    }
  },

  ls: async function ls(subdir: string) {
    const data = await gitExec.command(["ls-tree", "--name-only", "-r", "HEAD", esc(subdir)]);
    return dataToLines(data);
  },

  lsdirs: async function lsdirs() {
    if (!workTree) {
      return [];
    } // to make it run on dev systems
    const data = await gitExec.command(["ls-tree", "--name-only", "-d", "HEAD"]);
    return dataToLines(data);
  },
};
