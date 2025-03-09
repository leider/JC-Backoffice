import { differenceForAsObject } from "jc-shared/commons/comparingAndTransforming.ts";
import map from "lodash/map";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import keys from "lodash/keys";
import { HistoryDBType } from "jc-shared/history/history.ts";

export class HistoryRow {
  header = "";
  alt = {};
  neu = {};

  constructor(props: { header: string; alt?: object; neu?: object }) {
    Object.assign(this, props);
  }
  get asList() {
    return [this];
  }
}

type History = {
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
