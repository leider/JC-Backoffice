import fs from "fs";

import Git from "./gitmech";
import Diff from "./gitDiff";
import path from "path";
import { Metadata } from "./wikiObjects";
import childProcess from "child_process";

export default {
  BLOG_ENTRY_FILE_PATTERN: "blog_*",

  showPage: function showPage(
    completePageName: string,
    pageVersion: string,
    callback: (error: childProcess.ExecException | null, stdout: string, stderr: string) => void
  ): void {
    Git.readFile(completePageName + ".md", pageVersion, callback);
  },

  pageEdit: function pageEdit(completePageName: string, callback: Function): void {
    // eslint-disable-next-line no-sync
    if (!fs.existsSync(Git.absPath(completePageName + ".md"))) {
      return callback(null, "", ["NEW"]);
    }
    Git.readFile(completePageName + ".md", "HEAD", (err: Error | null, content: string) => {
      if (err) {
        return callback(err);
      }
      Git.log(completePageName + ".md", "HEAD", 1, (ignoredErr: Error | number, metadata: Metadata[]) => {
        callback(null, content, metadata);
      });
    });
  },

  pageRename: function pageRename(subdir: string, pageNameOld: string, pageNameNew: string, user: string, callback: Function): void {
    const completePageNameOld = subdir + "/" + pageNameOld + ".md";
    const completePageNameNew = subdir + "/" + pageNameNew + ".md";
    Git.mv(
      completePageNameOld,
      completePageNameNew,
      'rename: "' + pageNameOld + '" -> "' + pageNameNew + '"',
      user,
      (err: Error | null) => {
        callback(err, null);
      }
    );
  },

  pageSave: function pageSave(
    subdir: string,
    pageName: string,
    body: { content: string; metadata: string; comment: string },
    user: string,
    callback: Function
  ): void {
    fs.exists(Git.absPath(subdir), exists => {
      if (!exists) {
        try {
          // eslint-disable-next-line no-sync
          fs.mkdirSync(Git.absPath(subdir));
        } catch (e) {
          return callback(e);
        }
      }
      const completePageName = subdir + "/" + pageName + ".md";
      const pageFile = Git.absPath(completePageName);
      return fs.writeFile(pageFile, body.content, err => {
        if (err) {
          return callback(err);
        }
        return Git.log(completePageName, "HEAD", 1, (ignoredErr: Error | null, metadata: Metadata[]) => {
          const conflict = metadata[0] && metadata[0].fullhash !== body.metadata;
          Git.add(completePageName, body.comment.length === 0 ? "no comment" : (body.comment as string), user, (err1: Error | null) => {
            callback(err1, conflict);
          });
        });
      });
    });
  },

  pageHistory: function pageHistory(completePageName: string, callback: Function): void {
    Git.readFile(completePageName + ".md", "HEAD", (err: Error | null) => {
      if (err) {
        return callback(err);
      }
      return Git.log(completePageName + ".md", "HEAD", 30, (ignoredErr: Error | null, metadata: Metadata[]) => {
        callback(null, metadata);
      });
    });
  },

  pageCompare: function pageCompare(completePageName: string, revisions: string, callback: Function): void {
    Git.diff(completePageName + ".md", revisions, (err: Error | null, diff: string) => {
      if (err) {
        return callback(err);
      }
      return callback(null, new Diff(diff));
    });
  },

  pageList: function pageList(subdir: string, callback: Function): void {
    Git.ls(subdir, (err: Error | null, list: string[]) => {
      if (err) {
        return callback(err);
      }
      const items = list.map(row => {
        const rowWithoutEnding = row.replace(".md", "");
        return {
          fullname: rowWithoutEnding,
          name: path.basename(rowWithoutEnding)
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
        .filter(item => item.trim() !== "")
        .map(item => {
          const record = item.split(":");
          return {
            pageName: record[0].split(".")[0],
            line: record[1],
            text: record.slice(2).join("")
          };
        });
      return callback(null, result);
    });
  }
};
