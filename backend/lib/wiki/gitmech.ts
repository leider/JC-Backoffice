import { ExecException } from "child_process";

import gitExec from "./gitExec";
import conf from "../commons/simpleConfigure";
const workTree = conf.get("wikipath");

function dataToLines(data?: string): string[] {
  return data ? data.split("\n").filter((v) => v !== "") : [];
}

function esc(arg: string): string {
  // to secure command line execution
  return "'" + arg + "'";
}

function commit(
  path: string,
  message: string,
  author: string,
  // eslint-disable-next-line no-unused-vars
  callback: (error: ExecException | null, stdout: string, stderr: string) => void
): void {
  gitExec.command(["commit", "--author=" + esc(author), "-m", esc(message), esc(path)], callback);
}

export default {
  absPath: function absPath(path: string): string {
    return workTree + "/" + path;
  },

  readFile: function readFile(
    path: string,
    version: string,
    // eslint-disable-next-line no-unused-vars
    callback: ((error: ExecException | null, stdout: string, stderr: string) => void) | undefined
  ): void {
    gitExec.command(["show", version + ":" + esc(path)], callback);
  },

  add: function add(
    path: string,
    message: string,
    author: string,
    // eslint-disable-next-line no-unused-vars
    callback: (error: ExecException | null, stdout: string, stderr: string) => void
  ): void {
    gitExec.command(["add", esc(path)], (err: Error | null) => {
      if (err) {
        return callback(err, "", "");
      }
      return commit(path, message, author, callback);
    });
  },

  rm: function rm(
    path: string,
    message: string,
    author: string,
    // eslint-disable-next-line no-unused-vars
    callback: (error: ExecException | null, stdout: string, stderr: string) => void
  ): void {
    gitExec.command(["rm", esc(path)], (err: Error | null) => {
      if (err) {
        return callback(err, "", "");
      }
      return commit(path, message, author, callback);
    });
  },

  grep: function grep(pattern: string, callback: Function): void {
    gitExec.command(["grep", "--no-color", "-F", "-n", "-i", "-I", esc(pattern)], (err: Error | null, data: string) => {
      if (err) {
        if (err.message.split("\n").length < 3) {
          return callback(null, []);
        }
        return callback(err);
      }
      const result = data ? data.split("\n") : [];
      // Search in the file names
      return gitExec.command(["ls-files", "*" + esc(pattern) + "*.md"], (err1: Error | null, data1: string) => {
        if (data1) {
          data1.split("\n").forEach((name) => result.push(name));
        }

        return callback(err1, result);
      });
    });
  },

  ls: function ls(subdir: string, callback: Function): void {
    gitExec.command(["ls-tree", "--name-only", "-r", "HEAD", esc(subdir)], (err: Error | null, data: string) => {
      if (err) {
        return callback(err);
      }
      return callback(null, dataToLines(data));
    });
  },

  lsdirs: function lsdirs(callback: Function): void {
    if (!workTree) {
      return callback(null, []);
    } // to make it run on dev systems
    return gitExec.command(["ls-tree", "--name-only", "-d", "HEAD"], (err: Error | null, data: string) => {
      if (err || !data) {
        return callback(err);
      }
      return callback(null, dataToLines(data));
    });
  },
};
