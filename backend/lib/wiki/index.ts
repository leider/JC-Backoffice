import wikiService from "./wikiService";
import User from "../../../shared/user/user";
import { expressAppIn } from "../middleware/expressViewHelper";
import { reply } from "../commons/replies";
import misc from "../../../shared/commons/misc";
const app = expressAppIn(__dirname);

app.post("/search", (req, res, next) => {
  const searchtext = req.body.suchtext;
  return wikiService.search(searchtext, (err: Error | null, matches: { pageName: string; line: string; text: string }[]) => {
    reply(res, err, { searchtext, matches });
  });
});

app.post("/delete/:subdir/:page", (req, res, next) => {
  return wikiService.pageDelete(req.params.subdir, req.params.page, (req.user as User).asGitAuthor, (err: Error | null) => {
    reply(res, err);
  });
});

app.post("/:subdir/:page", (req, res) => {
  const pageName = misc.normalizeString(req.params.page);
  const subdir = req.params.subdir;
  const content = req.body.content;
  wikiService.pageSave(subdir, pageName, content, (req.user as User).asGitAuthor, (err?: Error) => {
    reply(res, err, { content });
  });
});

app.get("/list/:subdir/alle.json", (req, res) => {
  const subdir = req.params.subdir;
  wikiService.pageList(subdir, (err: Error | null, items: Array<{ fullname: string; name: string }>) => {
    reply(res, err, items);
  });
});

app.get("/:subdir/:page", (req, res) => {
  const completePageName = `${req.params.subdir}/${misc.normalizeString(req.params.page.replace(".json", ""))}`;
  wikiService.showPage(completePageName, "HEAD", (err: Error | null, cont: string) => {
    let error = err;
    if ((error?.message || "").indexOf("does not exist") > -1) {
      error = null;
    }
    const content = cont || "";
    reply(res, error, { content });
  });
});

export default app;
