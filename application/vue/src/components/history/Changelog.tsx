import { useQuery } from "@tanstack/react-query";
import { historyRowsFor } from "@/commons/loader.ts";
import React, { useMemo } from "react";
import { differenceForAsObject } from "jc-shared/commons/comparingAndTransforming.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import JsonView from "@uiw/react-json-view";
import { HistoryType } from "jc-backend/rest/history.ts";
import forEach from "lodash/forEach";
import keys from "lodash/keys";

export function Changelog({ id, collection }: { collection: string; id?: string }) {
  const { data: rows } = useQuery({
    enabled: !!id,
    queryKey: ["history", collection, id],
    queryFn: () => historyRowsFor(collection, id!),
  });

  const changelog = useMemo(() => {
    const changelogObject: { [idx: string]: object } = {};
    forEach(rows, (row) => {
      const result: Omit<HistoryType, "id" | "before" | "after"> & {
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
        changelogObject[`NEUANLAGE - ${header}`] = differenceForAsObject(result.before, result.after);
      } else if (result.before.id && keys(result.after).length === 1) {
        changelogObject[`GELÖSCHT - ${header}`] = {};
      } else {
        changelogObject[header] = differenceForAsObject(result.before, result.after);
      }
    });
    return changelogObject;
  }, [rows]);

  return keys(changelog).length === 0 ? undefined : (
    <JsonView value={changelog} displayDataTypes={false} displayObjectSize={false} enableClipboard={false} quotes="" />
  );
}
