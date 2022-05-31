import Fs from "fs/promises";

import Git from "./gitmech";

export default {
  BLOG_ENTRY_FILE_PATTERN: "blog_*",

  showPage: async function showPage(completePageName: string, pageVersion: string) {
    return Git.readFile(completePageName + ".md", pageVersion);
  },

  pageSave: async function pageSave(subdir: string, pageName: string, content: string, user: string) {
    try {
      const stats = await Fs.stat(Git.absPath(subdir));
      if (stats && !stats.isDirectory()) {
        await Fs.mkdir(Git.absPath(subdir));
      }
    } catch (e) {
      await Fs.mkdir(Git.absPath(subdir));
    }
    const completePageName = `${subdir}/${pageName}.md`;
    const pageFile = Git.absPath(completePageName);
    try {
      const contentOld = await Git.readFile(completePageName, "HEAD");
      if (contentOld && content === contentOld) {
        return contentOld;
      }
    } catch (err: any) {
      if (err && err.message.indexOf("does not exist") === -1) {
        throw err;
      }
    }

    await Fs.writeFile(pageFile, content);
    Git.add(completePageName, "no comment", user);
    return content;
  },

  pageDelete: async function pageDelete(subdir: string, pageName: string, user: string) {
    const completePageName = subdir + "/" + pageName + ".md";
    await Git.readFile(completePageName, "HEAD");
    return Git.rm(completePageName, "no comment", user);
  },

  search: async function search(searchtext: string) {
    const items = await Git.grep(searchtext);
    return items
      .filter((item) => item.trim() !== "")
      .map((item) => {
        const record = item.split(":");
        return {
          pageName: record[0].split(".")[0],
          line: record[1],
          text: record.slice(2).join(""),
        };
      });
  },
};
