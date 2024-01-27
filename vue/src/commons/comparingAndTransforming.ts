import cloneDeep from "lodash/cloneDeep";
import isEqual from "lodash/isEqual";
import { detailedDiff } from "deep-object-diff";

/**
 * this function will modify data!
 *
 * @param data an object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stripNullOrUndefined<T>(data: T & { [index: string]: any }): T {
  if (!data) {
    return data;
  }
  const keys = Object.keys(data);
  keys.forEach((key) => {
    if (data[key] === null || data[key] === undefined) {
      delete data[key];
    }
    if (typeof data[key] === "object") {
      // Array is typeof "object"
      stripNullOrUndefined(data[key]);
    }
  });
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function withoutNullOrUndefinedStrippedBy<T>(data: T & { [p: string]: any }, propertiesToIgnore?: string[]): T {
  const clone = cloneDeep(data);
  propertiesToIgnore?.forEach((key) => {
    delete clone[key];
  });
  return stripNullOrUndefined(clone);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function areDifferent(left: any, right: any, propertiesToIgnore?: string[]) {
  return !isEqual(withoutNullOrUndefinedStrippedBy(left, propertiesToIgnore), withoutNullOrUndefinedStrippedBy(right, propertiesToIgnore));
}

export function differenceFor(left = {}, right = {}, propertiesToIgnore?: string[]): string {
  const a = withoutNullOrUndefinedStrippedBy(left, propertiesToIgnore);
  const b = withoutNullOrUndefinedStrippedBy(right, propertiesToIgnore);
  const diff = detailedDiff(a, b);
  const translated: { hinzugefügt?: object; gelöscht?: object; geändert?: object } = {
    hinzugefügt: diff.added,
    gelöscht: diff.deleted,
    geändert: diff.updated,
  };
  if (Object.keys(translated.hinzugefügt || {}).length === 0) {
    delete translated.hinzugefügt;
  }
  if (Object.keys(translated.gelöscht || {}).length === 0) {
    delete translated.gelöscht;
  }
  if (Object.keys(translated.geändert || {}).length === 0) {
    delete translated.geändert;
  }
  return JSON.stringify(translated, null, 2);
}
