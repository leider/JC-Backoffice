import isEqual from "lodash/isEqual.js";
import difference from "lodash/difference.js";
import differenceWith from "lodash/differenceWith.js";
import map from "lodash/map.js";
import uniq from "lodash/uniq.js";
import filter from "lodash/filter.js";

export function calculateChangedAndDeleted<T extends { id: string }>(newItems: T[], oldItems: T[]) {
  const currentIds: string[] = map(newItems, "id");
  const oldIds: string[] = map(oldItems, "id");

  const deletedIds = difference(oldIds, currentIds);
  const addedIds = difference(currentIds, oldIds);

  const changedIds: string[] = map(differenceWith(oldItems, newItems, isEqual), "id");
  const allChangedIds = uniq(addedIds.concat(changedIds));

  const changed = filter(newItems, (item) => allChangedIds.includes(item.id));
  return { deletedIds, changed };
}
