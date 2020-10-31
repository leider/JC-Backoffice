import path from "path";
import service from "./imageService";
import { ImageOverviewRow } from "../veranstaltungen/object/veranstaltung";

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
    res.sendStatus(403);
    return;
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
      res.status(500).send(err);
      return;
    }
    allImageNames(res);
  });
});

export default app;
