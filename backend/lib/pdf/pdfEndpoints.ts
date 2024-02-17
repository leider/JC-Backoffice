import express, { NextFunction, Request, Response } from "express";
import path, { dirname } from "path";
import { kassenbericht, kassenzettel, riderPdf, vermietungAngebot, vertrag } from "./pdfGeneration.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.get("/kassenbericht/:year/:month", (req: Request, res: Response, next: NextFunction) => {
  const datum = DatumUhrzeit.forYYYYMM(req.params.year + "" + req.params.month);
  kassenbericht(res, next, datum);
});

app.get("/kassenzettel/:url", (req, res, next) => {
  kassenzettel(res, next, req.params.url);
});

app.get("/vertrag/:url/:language", async (req, res, next) => {
  vertrag(res, next, req.params.url, req.params.language);
});

app.get("/vermietungAngebot/:url/:art", async (req, res, next) => {
  vermietungAngebot(res, next, req.params.url, req.params.art);
});

app.get("/rider/:url", async (req, res, next) => {
  riderPdf(res, next, req.params.url);
});

export default app;
