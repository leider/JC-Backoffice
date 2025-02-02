import express, { Request, Response } from "express";
import { resToJson } from "../lib/commons/replies.js";
import { db, escape } from "../lib/persistence/sqlitePersistence.js";
import groupBy from "lodash/groupBy.js";
import map from "lodash/map.js";
import keys from "lodash/keys.js";
import { HistoryDBType } from "jc-shared/history/history.js";

const app = express();

const mappedNames: { [idx: string]: string } = {
  Mailregeln: "mailstorehistory",
  Optionen: "optionenstorehistory",
  Programmheft: "kalenderstorehistory",
  Rider: "riderstorehistory",
  User: "userstorehistory",
  Termine: "terminstorehistory",
  Veranstaltung: "veranstaltungenstorehistory",
  Vermietung: "vermietungenstorehistory",
};

app.get("/history/:collection/:id", async (req: Request, res: Response) => {
  function prunePasswords(dataString: string) {
    const pruned = JSON.parse(dataString);
    return JSON.stringify({
      ...pruned,
      hashedPassword: pruned.hashedPassword ? `${pruned.hashedPassword.substring(0, 3)}XXX` : undefined,
      salt: "YYY",
    });
  }
  const collection = req.params.collection;
  const id = req.params.id;
  if (collection === "undefined" || id === "undefined") {
    return resToJson(res, []);
  }
  const history = mappedNames[collection];
  const query = `SELECT * FROM ${history} WHERE id = ${escape(id)} ORDER BY time DESC;`;
  const result = db.prepare<HistoryDBType[], HistoryDBType>(query).all();

  if (collection === "User") {
    return resToJson(
      res,
      map(result, (record) => {
        record.before = prunePasswords(record.before);
        record.after = prunePasswords(record.after);
        return record;
      }),
    );
  }

  resToJson(res, result);
});

app.get("/history/:collection", async (req: Request, res: Response) => {
  const collection = req.params.collection;
  if (collection === "undefined") {
    return resToJson(res, []);
  }
  const history = mappedNames[collection];
  const query = `SELECT DISTINCT id, time, after FROM ${history} ORDER BY time DESC;`;
  const result = db.prepare(query).all();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idWithMore = groupBy(result as any, (elem) => elem.id);
  const resAsObject = map(keys(idWithMore), (key) => {
    const newestRow = idWithMore[key][0];
    const state = keys(JSON.parse(newestRow.after)).length === 1 ? "gelöscht" : "geändert";
    return { id: key, time: newestRow.time, state };
  });

  resToJson(res, resAsObject);
});

export default app;
