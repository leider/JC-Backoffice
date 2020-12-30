import fs from "fs";
import path from "path";
import { ExecException } from "child_process";

import Git from "./gitmech";

export default {
  BLOG_ENTRY_FILE_PATTERN: "blog_*",

  showPage: function showPage(
    completePageName: string,
    pageVersion: string,
    // eslint-disable-next-line no-unused-vars
    callback: (error: ExecException | null, stdout: string, stderr: string) => void
  ): void {
    Git.readFile(completePageName + ".md", pageVersion, callback);
  },

  pageSave: function pageSave(subdir: string, pageName: string, content: string, user: string, callback: Function): void {
    fs.access(Git.absPath(subdir), (err) => {
      if (err) {
        try {
          // eslint-disable-next-line no-sync
          fs.mkdirSync(Git.absPath(subdir));
        } catch (e) {
          return callback(e);
        }
      }
      const completePageName = subdir + "/" + pageName + ".md";
      const pageFile = Git.absPath(completePageName);

      Git.readFile(completePageName, "HEAD", (err: Error | null, contentOld: string) => {
        if (err && err.message.indexOf("does not exist") === -1) {
          return callback(err);
        }
        if (contentOld && content === contentOld) {
          return callback(null, contentOld);
        }
        return fs.writeFile(pageFile, content, (err) => {
          if (err) {
            return callback(err);
          }
          Git.add(completePageName, "no comment", user, (err1: Error | null) => {
            callback(err1, content);
          });
        });
      });
    });
  },

  pageDelete: function pageDelete(subdir: string, pageName: string, user: string, callback: Function): void {
    const completePageName = subdir + "/" + pageName + ".md";

    Git.readFile(completePageName, "HEAD", (err: Error | null) => {
      if (err) {
        return callback(err);
      }
      Git.rm(completePageName, "no comment", user, (err1: Error | null) => {
        callback(err1);
      });
    });
  },

  pageList: function pageList(subdir: string, callback: Function): void {
    Git.ls(subdir, (err: Error | null, list: string[]) => {
      if (err) {
        return callback(err);
      }
      const items = list.map((row) => {
        const rowWithoutEnding = row.replace(".md", "");
        return {
          fullname: rowWithoutEnding,
          name: path.basename(rowWithoutEnding),
        };
      });
      return callback(null, items);
    });
  },

  search: function search(searchtext: string, callback: Function): void {
    Git.grep(searchtext, (err: Error | null, items: string[]) => {
      if (err) {
        return callback(err);
      }
      const result = items
        .filter((item) => item.trim() !== "")
        .map((item) => {
          const record = item.split(":");
          return {
            pageName: record[0].split(".")[0],
            line: record[1],
            text: record.slice(2).join(""),
          };
        });
      return callback(null, result);
    });
  },
};
