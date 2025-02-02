import DatumUhrzeit from "../commons/DatumUhrzeit.js";
import { differenceForAsObject, DiffType, JazzDiff } from "../commons/comparingAndTransforming.js";
import keys from "lodash/keys.js";
import map from "lodash/map.js";
import forEach from "lodash/forEach.js";

type HistoryRowType = JazzDiff & {
  header: string;
};

class HistoryRow implements HistoryRowType {
  header = "";
  geändert = undefined;
  gelöscht = undefined;
  hinzugefügt = undefined;

  constructor(props: HistoryRowType) {
    Object.assign(this, props);
  }
  get asList() {
    const row: DiffType[] = ["hinzugefügt", "geändert", "gelöscht"];

    const res: { typ: DiffType; val: object }[] = [];
    forEach(row, (typ) => {
      if (this[typ]) {
        res.push({ typ, val: this[typ] });
      }
    });
    return res;
  }
}

export type HistoryDBType = { id: string; before: string; after: string; user: string; time: string };

export type History = {
  rows: HistoryRow[];
};

export function historyFromRawRows(rows?: HistoryDBType[]): History {
  return {
    rows: map(rows, (row) => {
      const result: Omit<HistoryDBType, "id" | "before" | "after"> & {
        before: { id?: string; changelist?: string };
        after: { id?: string; changelist?: string };
      } = {
        before: {},
        after: {},
        user: "",
        time: "",
      };
      Object.assign(result, row, {
        before: JSON.parse(row.before),
        after: JSON.parse(row.after),
        time: DatumUhrzeit.forISOString(row.time).toLocalDateTimeString,
      });
      delete result.before.changelist;
      delete result.after.changelist;
      const header = result.user + " " + result.time;

      if (!result.before.id && result.after.id) {
        return new HistoryRow({ header: `NEUANLAGE - ${header}`, ...differenceForAsObject(result.before, result.after) });
      } else if (result.before.id && keys(result.after).length === 1) {
        return new HistoryRow({ header: `GELÖSCHT - ${header}` });
      } else {
        return new HistoryRow({ header, ...differenceForAsObject(result.before, result.after) });
      }
    }),
  };
}
