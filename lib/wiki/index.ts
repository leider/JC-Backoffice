import express from "express";
import renderer from "../commons/renderer";
import wikiService from "./wikiService";
import statusmessage from "../commons/statusmessage";
import { Metadata } from "./wikiObjects";
import Diff from "./gitDiff";
import User from "../users/user";
import { expressAppIn } from "../middleware/expressViewHelper";

function showPage(
  subdir: string,
  pageName: string,
  pageVersion: string,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const normalizedPageName = renderer.normalize(pageName);
  const completePageName = subdir + "/" + normalizedPageName;
  wikiService.showPage(completePageName, pageVersion, (err: Error | null, content: string) => {
    if (err || !content) {
      if (req.user) {
        return res.redirect("/wiki/edit/" + completePageName);
      }
      return next();
    }
    const headerAndBody = renderer.titleAndRenderedTail(content, subdir);
    return res.render("get", {
      content: headerAndBody.body,
      title: headerAndBody.title,
      pageName: normalizedPageName,
      subdir,
      canEdit: pageVersion === "HEAD" && req.user,
    });
  });
}

const app = expressAppIn(__dirname);

// wiki pages

app.get("/versions/:subdir/:page", (req, res, next) => {
  const pageName = req.params.page;
  const subdir = req.params.subdir;
  const completePageName = subdir + "/" + pageName;
  wikiService.pageHistory(completePageName, (err: Error | null, metadata: Metadata[]) => {
    if (err || !metadata) {
      return next(err);
    }
    return res.render("history", {
      pageName,
      subdir,
      items: metadata,
    });
  });
});

app.get("/compare/:subdir/:page/:revisions", (req, res, next) => {
  const pageName = req.params.page;
  const subdir = req.params.subdir;
  const completePageName = subdir + "/" + pageName;
  const revisions = req.params.revisions;
  wikiService.pageCompare(completePageName, revisions, (err: Error | null, diff: Diff) => {
    if (err || !diff) {
      return next();
    }
    return res.render("compare", {
      pageName,
      subdir,
      lines: diff.asLines(),
    });
  });
});

// editing pages

app.get("/edit/:subdir/:page", (req, res, next) => {
  const pageName = renderer.normalize(req.params.page);
  const subdir = req.params.subdir;
  const completePageName = subdir + "/" + pageName;
  wikiService.pageEdit(completePageName, (err: Error | null, content: string, metadata: Metadata[]) => {
    if (err) {
      return next(err);
    }
    return res.render("edit", {
      page: { content, comment: "", metadata: metadata[0].fullhash },
      subdir,
      pageName,
    });
  });
});

app.post("/:subdir/:page", (req, res) => {
  const pageName = renderer.normalize(req.params.page);
  const subdir = req.params.subdir;
  wikiService.pageSave(subdir, pageName, req.body, (req.user as User).asGitAuthor, (err: Error | null, conflict: boolean) => {
    if (err) {
      statusmessage.errorMessage("Problem", "Das Speichern war nicht erfolgreich.").putIntoSession(req);
    } else if (conflict) {
      statusmessage
        .errorMessage(
          "Konflikt",
          "Deine Änderungen wurden gespeichert. Du hast allerdings Änderungen eines anderen Benutzers überschrieben. Bitte überprüfe nochmals die Wikiseite."
        )
        .putIntoSession(req);
    } else {
      statusmessage.successMessage("Speichern erfolgreich", "Deine Änderungen wurden gespeichert.").putIntoSession(req);
    }
    res.redirect("/wiki/" + subdir + "/" + pageName);
  });
});

app.post("/rename/:subdir/:page", (req, res, next) => {
  const pageNameNew = renderer.normalize(req.body.newName);
  const subdir = req.params.subdir;
  wikiService.pageRename(subdir, req.params.page, pageNameNew, (req.user as User).asGitAuthor, (err: Error | null) => {
    if (err) {
      statusmessage.errorMessage("Problem", "Das Speichern war nicht erfolgreich.").putIntoSession(req);
      return next(err);
    }
    statusmessage.successMessage("Speichern erfolgreich", "Deine Änderungen wurden gespeichert.").putIntoSession(req);
    return res.redirect("/wiki/" + subdir + "/" + pageNameNew);
  });
});

// showing pages

app.get("/list/:subdir/", (req, res, next) => {
  const subdir = req.params.subdir;
  wikiService.pageList(subdir, (err: Error | null, items: Array<{ fullname: string; name: string }>) => {
    if (err) {
      return next(err);
    }
    return res.render("list", { items, subdir });
  });
});

app.get("/modal/:subdir/:page", (req, res, next) => {
  const subdir = req.params.subdir;
  const completePageName = subdir + "/" + req.params.page;
  wikiService.showPage(completePageName, "HEAD", (err: Error | null, content: string) => {
    if (err) {
      return next(err);
    }
    return res.render("modal", {
      content: content && renderer.render(content, subdir),
      subdir,
    });
  });
});

app.get("/:subdir/:page", (req, res, next) => {
  const version = <string>req.query.version || "HEAD";
  showPage(req.params.subdir, req.params.page, version, req, res, next);
});

app.get("/:subdir/", (req, res) => {
  res.redirect("/wiki/" + req.params.subdir + "/index");
});

app.get("/:subdir", (req, res) => {
  res.redirect("/wiki/" + req.params.subdir + "/index");
});

app.get("/", (req, res) => {
  res.redirect("/wiki/alle/index");
});

app.post("/search", (req, res, next) => {
  const searchtext = req.body.searchtext;
  if (searchtext.length < 2) {
    statusmessage.errorMessage("Suchtext zu kurz", "Dein eingegebener Suchtext ist zu kurz.").putIntoSession(req);
    return res.redirect(req.headers.referer || "/wiki/alle/index");
  }
  return wikiService.search(searchtext, (err: Error | null, matches: Array<{ pageNAme: string; line: string; text: string }>) => {
    if (err) {
      return next(err);
    }
    return res.render("searchresults", { searchtext, matches });
  });
});

export default app;
