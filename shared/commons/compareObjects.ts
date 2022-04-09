import { detailedDiff } from "deep-object-diff";

export function differenceFor(a = {}, b = {}): string {
  const diff = detailedDiff(a, b) as { added: any; deleted: any; updated: any };
  const translated = { hinzugefügt: diff.added, gelöscht: diff.deleted, geändert: diff.updated };
  return JSON.stringify(translated, null, 2);
}
