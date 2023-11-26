import { detailedDiff } from "deep-object-diff";
import isEqual from "lodash/isEqual.js";
import difference from "lodash/difference.js";
import differenceWith from "lodash/differenceWith.js";
import map from "lodash/map.js";
import uniq from "lodash/uniq.js";

export function differenceFor(a = {}, b = {}): string {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  const diff = detailedDiff(a, b) as { added: any; deleted: any; updated: any };
  const translated = { hinzugefügt: diff.added, gelöscht: diff.deleted, geändert: diff.updated };
  return JSON.stringify(translated, null, 2);
}

export function calculateChangedAndDeleted<T extends { id: string }>(newItems: T[], oldItems: T[]) {
  const currentIds: string[] = map(newItems, "id");
  const oldIds: string[] = map(oldItems, "id");

  const deletedIds = difference(oldIds, currentIds);
  const addedIds = difference(currentIds, oldIds);

  const changedIds: string[] = map(differenceWith(oldItems, newItems, isEqual), "id");
  const allChangedIds = uniq(addedIds.concat(changedIds));

  const changed = newItems.filter((item) => allChangedIds.includes(item.id)) || [];
  return { deletedIds, changed };
}
