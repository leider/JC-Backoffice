import difference from "lodash/difference";
import intersection from "lodash/intersection";
import flatten from "lodash/flatten";
import uniq from "lodash/uniq";

import path from "path";
import store from "../veranstaltungen/veranstaltungenstore";
import service from "./imageService";
import Veranstaltung, { ImageOverviewRow, ImageOverviewVeranstaltung } from "../veranstaltungen/object/veranstaltung";

import { expressAppIn } from "../middleware/expressViewHelper";
import sharp from "sharp";
import { Response } from "express";

const app = expressAppIn(__dirname);

const uploadDir = path.join(__dirname, "../../static/upload");

app.get("/imagepreview/:filename", (req, res, next) => {
  sharp(uploadDir + "/" + req.params.filename)
    .resize({ width: 800 })
    .toBuffer((err, buffer) => {
      if (err) {
        if (err.message === "Input file is missing") {
          return next();
        }
        return next(err);
      }
      res.send(buffer);
    });
});

app.get("/allWithImageNames", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }

  service.alleBildNamen((errNames: Error | null, imagenamesOfFiles: string[]) => {
    return store.alle((err: Error | null, result: Veranstaltung[]) => {
      if (err) {
        return next(err);
      }
      const liste = result.map((v) => v.suitableForImageOverview);

      function elementsWithImage(imageName: string): ImageOverviewVeranstaltung[] {
        return liste.filter((each) => each.images.find((i) => i.localeCompare(imageName) === 0));
      }
      const imagenamesOfVeranstaltungen = uniq(flatten(liste.map((each) => each.images))).sort();
      const goodImages = intersection(imagenamesOfFiles, imagenamesOfVeranstaltungen);
      const unusedImages = difference(imagenamesOfFiles, imagenamesOfVeranstaltungen);
      const notFoundImages = difference(imagenamesOfVeranstaltungen, imagenamesOfFiles);

      const imagesWithVeranstaltungen = goodImages.map((im) => {
        return { image: im, veranstaltungen: elementsWithImage(im) };
      });
      const imagesWithVeranstaltungenUnused = unusedImages.map((im) => {
        return { image: im, veranstaltungen: elementsWithImage(im) };
      });
      const imagesWithVeranstaltungenNotFound = notFoundImages.map((im) => {
        return { image: im, veranstaltungen: elementsWithImage(im) };
      });
      res.render("imageliste", { liste, imagesWithVeranstaltungen, imagesWithVeranstaltungenUnused, imagesWithVeranstaltungenNotFound });
    });
  });
});

function allImageNames(res: Response): void {
  service.alleBildNamen((err: Error | null, imagenamesOfFiles: string[]) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.set("Content-Type", "application/json").send(imagenamesOfFiles);
  });
}

app.get("/allImagenames.json", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }
  allImageNames(res);
});

app.post("/imagenamesChanged", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }

  const rows = req.body as ImageOverviewRow[];
  service.renameImages(rows, (err) => {
    if (err) {
      return next(err);
    }
    allImageNames(res);
  });
});

app.post("/imagenameSubmit", (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect("/");
  }

  const body = req.body;
  const newname = body.newname.replace(/[()/]/g, "_");
  if (body.oldname === newname) {
    return res.redirect("/image/allWithImageNames");
  }

  service.renameImage(body.oldname, newname, JSON.parse(body.ids), (err) => {
    if (err) {
      return next(err);
    }
    return res.redirect("/image/allWithImageNames");
  });
});

export default app;
