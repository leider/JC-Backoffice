import express, { Request, Response } from "express";
import { resToJson } from "../lib/commons/replies.js";
import { db, escape } from "../lib/persistence/sqlitePersistence.js";

const app = express();

const mappedNames: { [idx: string]: string } = {
  Mailregeln: "mailstorehistory",
  Optionen: "optionenstorehistory",
  Programmheft: "kalenderstorehistory",
  User: "userstorehistory",
  Termine: "terminstorehistory",
  Veranstaltung: "veranstaltungenstorehistory",
  Vermietung: "vermietungenstorehistory",
};

app.get("/history/:collection/:id", async (req: Request, res: Response) => {
  const collection = req.params.collection;
  const id = req.params.id;
  if (collection === "undefined" || id === "undefined") {
    return resToJson(res, []);
  }
  const history = mappedNames[collection];
  const query = `SELECT * FROM ${history} WHERE id = ${escape(id)} ORDER BY time DESC;`;
  const result = db.prepare(query).all();

  resToJson(res, result);
});

app.get("/history/:collection", async (req: Request, res: Response) => {
  const collection = req.params.collection;
  if (collection === "undefined") {
    return resToJson(res, []);
  }
  const history = mappedNames[collection];
  const query = `SELECT DISTINCT id FROM ${history} ORDER BY id ASC;`;
  const result = db
    .prepare(query)
    .all()
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((res: any) => res.id) as string[];

  resToJson(res, result);
});

export default app;
