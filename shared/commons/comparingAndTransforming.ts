import cloneDeep from "lodash/cloneDeep.js";
import isEqual from "lodash/isEqual.js";
import { detailedDiff } from "deep-object-diff";

/**
 * this function will modify data!
 *
 * @param data an object
 */
function stripNullOrUndefined<T>(data: T & { [index: string]: unknown }): T {
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
      stripNullOrUndefined(data[key] as object & { [index: string]: unknown });
    }
  });
  return data;
}

export function withoutNullOrUndefinedStrippedBy<T>(data: T & { [p: string]: unknown }, propertiesToIgnore?: string[]): T {
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

export function differenceForAsObject(left = {}, right = {}, propertiesToIgnore?: string[]): object {
  const a = withoutNullOrUndefinedStrippedBy(left, propertiesToIgnore);
  const b = withoutNullOrUndefinedStrippedBy(right, propertiesToIgnore);
  const diffAtoB = detailedDiff(a, b);
  const diffBtoA = detailedDiff(b, a);
  const diff: { geändert?: object; hinzugefügt?: object; gelöscht?: object } = {};
  if (!(Object.keys(diffAtoB.updated || {}).length === 0 && Object.keys(diffBtoA.updated || {}).length === 0)) {
    diff.geändert = { neu: diffAtoB.updated, alt: diffBtoA.updated };
  }
  if (!(Object.keys(diffAtoB.added || {}).length === 0)) {
    diff.hinzugefügt = diffAtoB.added;
  }
  if (!(Object.keys(diffAtoB.deleted || {}).length === 0)) {
    diff.gelöscht = diffAtoB.deleted;
  }
  return diff;
}
