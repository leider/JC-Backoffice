import { difference, intersection, flatten, uniq } from "lodash";

import path from "path";
import store from "../veranstaltungen/veranstaltungenstore";
import service from "./imageService";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";

import { expressAppIn } from "../middleware/expressViewHelper";
import sharp from "sharp";

const app = expressAppIn(__dirname);

const uploadDir = path.join(__dirname, "../../static/upload");

app.get("/imagepreview/:filename", (req, res, next) => {
  sharp(uploadDir + "/" + req.params.filename)
    .resize({ width: 800 })
    .toBuffer((err, buffer) => {
      if (err) {
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
      const liste = result.map((v) => {
        return {
          id: v.id,
          startDate: v.startDatumUhrzeit(),
          titel: v.kopf.titel,
          fullyQualifiedUrl: v.fullyQualifiedUrl(),
          images: v.presse.image,
        };
      });
      function elementsWithImage(imageName: string): any[] {
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
