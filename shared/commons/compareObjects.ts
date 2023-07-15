import { detailedDiff } from "deep-object-diff";
import _ from "lodash";

export function differenceFor(a = {}, b = {}): string {
  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  const diff = detailedDiff(a, b) as { added: any; deleted: any; updated: any };
  const translated = { hinzugefügt: diff.added, gelöscht: diff.deleted, geändert: diff.updated };
  return JSON.stringify(translated, null, 2);
}

export function calculateChangedAndDeleted<T extends { id: string }>(newItems: T[], oldItems: T[]) {
  const currentIds: string[] = _.map(newItems, "id");
  const oldIds: string[] = _.map(oldItems, "id");

  const deletedIds = _.difference(oldIds, currentIds);
  const addedIds = _.difference(currentIds, oldIds);

  const changedIds: string[] = _.map(_.differenceWith(oldItems, newItems, _.isEqual), "id");
  const allChangedIds = _.uniq(addedIds.concat(changedIds));

  const changed = newItems.filter((item) => allChangedIds.includes(item.id)) || [];
  return { deletedIds, changed };
}
