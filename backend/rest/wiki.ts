import express from "express";

import User from "jc-shared/user/user";
import misc from "jc-shared/commons/misc";

import wikiService from "../lib/wiki/wikiService";
import { resToJson } from "../lib/commons/replies";
import Git from "../lib/wiki/gitmech";

const app = express();

app.get("/wikidirs", async (req, res) => {
  const gitdirs = await Git.lsdirs();
  resToJson(res, { dirs: gitdirs });
});

app.get("/wikipage/:subdir/:page", async (req, res) => {
  const completePageName = `${req.params.subdir}/${misc.normalizeString(req.params.page)}`;
  try {
    const content = await wikiService.showPage(completePageName, "HEAD");
    resToJson(res, { content });
  } catch (e: any) {
    if ((e.message || "").indexOf("does not exist") > -1) {
      return resToJson(res, { content: "" });
    }
    throw e;
  }
});

app.post("/wikipage/search", async (req, res) => {
  const searchtext = req.body.suchtext;
  const matches = wikiService.search;
  resToJson(res, { searchtext, matches });
});

app.delete("/wikipage/:subdir/:page", async (req, res) => {
  const pageName = misc.normalizeString(req.params.page);
  await wikiService.pageDelete(req.params.subdir, pageName, (req.user as User).asGitAuthor);
  resToJson(res);
});

app.post("/wikipage/:subdir/:page", async (req, res) => {
  const pageName = misc.normalizeString(req.params.page);
  const subdir = req.params.subdir;
  const content = await wikiService.pageSave(subdir, pageName, req.body.content, (req.user as User).asGitAuthor);
  resToJson(res, { content });
});

export default app;
