import express from "express";

import User from "jc-shared/user/user.js";
import misc from "jc-shared/commons/misc.js";

import wikiService from "../lib/wiki/wikiService.js";
import { resToJson } from "../lib/commons/replies.js";
import Git from "../lib/wiki/gitmech.js";
import parseFormData from "../lib/commons/parseFormData.js";

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
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if ((e.message || "").includes("does not exist")) {
      return resToJson(res, { content: "" });
    }
    throw e;
  }
});

app.post("/wikipage/search", async (req, res) => {
  const searchtext = req.body.suchtext;
  const matches = await wikiService.search(searchtext);
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

app.post("/wiki/upload", async (req, res) => {
  const { files } = await parseFormData(req);
  if (!files.datei || !files.datei.length) {
    res.status(500).send("keine Datei");
    return;
  }
  const datei = files.datei[0];
  try {
    const savedName = await wikiService.saveWikiImage({ datei });
    const url = encodeURI(`/wiki/${savedName}`);
    resToJson(res, { url });
  } catch (e) {
    res.status(500).send((e as Error).message);
    return;
  }
});

export default app;
