import express from "express";

import User from "jc-shared/user/user";
import misc from "jc-shared/commons/misc";

import wikiService from "../lib/wiki/wikiService";
import { reply } from "../lib/commons/replies";
import Git from "../lib/wiki/gitmech";
const app = express();

app.get("/wikidirs", (req, res) => {
  Git.lsdirs((err: Error | null, gitdirs: string[]) => {
    reply(res, err, { dirs: gitdirs });
  });
});

app.get("/wikipage/:subdir/:page", (req, res) => {
  const completePageName = `${req.params.subdir}/${misc.normalizeString(req.params.page)}`;
  wikiService.showPage(completePageName, "HEAD", (err: Error | null, cont: string) => {
    let error = err;
    if ((error?.message || "").indexOf("does not exist") > -1) {
      error = null;
    }
    const content = cont || "";
    reply(res, error, { content });
  });
});

app.post("/wikipage/search", (req, res) => {
  const searchtext = req.body.suchtext;
  return wikiService.search(searchtext, (err: Error | null, matches: { pageName: string; line: string; text: string }[]) => {
    reply(res, err, { searchtext, matches });
  });
});

app.delete("/wikipage/:subdir/:page", (req, res) => {
  const pageName = misc.normalizeString(req.params.page);
  return wikiService.pageDelete(req.params.subdir, pageName, (req.user as User).asGitAuthor, (err: Error | null) => {
    reply(res, err);
  });
});

app.post("/wikipage/:subdir/:page", (req, res) => {
  const pageName = misc.normalizeString(req.params.page);
  const subdir = req.params.subdir;
  const content = req.body.content;
  wikiService.pageSave(subdir, pageName, content, (req.user as User).asGitAuthor, (err?: Error) => {
    reply(res, err, { content });
  });
});

export default app;
