import { detailedDiff } from "deep-object-diff";

type SomeObject = { [index: string]: SomeObject };

/**
 * this function will modify data!
 *
 * @param data an object
 */
function stripNullOrUndefined<T extends object>(data: T): T {
  if (!data) {
    return data;
  }
  const keys = Object.keys(data);
  keys.forEach((key) => {
    const dataCasted = data as T & SomeObject;
    if (dataCasted[key] === null || dataCasted[key] === undefined) {
      delete dataCasted[key];
    }
    if (typeof dataCasted[key] === "object") {
      // Array is typeof "object"
      stripNullOrUndefined(dataCasted[key]);
    }
    if (key === "key") {
      delete dataCasted[key];
    }
  });
  return data;
}

export function withoutNullOrUndefinedStrippedBy<T extends object>(data: T, propertiesToIgnore?: string[]): T {
  function deleteProp(clone: typeof data, nameWithDots: string) {
    const nameArray = nameWithDots.split(".");
    if (nameArray.length === 0) {
      return;
    }
    const last = nameArray.pop() as string;
    let target: SomeObject = clone as SomeObject;
    nameArray.forEach((part) => {
      target = target[part];
      if (!target) {
        return;
      }
    });
    if (target) {
      delete target[last];
    }
  }
  const clone = JSON.parse(JSON.stringify(data));
  propertiesToIgnore?.forEach((key) => {
    deleteProp(clone, key);
  });
  return stripNullOrUndefined(clone);
}

export function areDifferentForHistoryEntries<T extends object>(left: T, right: T, propertiesToIgnore?: string[]) {
  return !!Object.keys(differenceForAsObject(left, right, propertiesToIgnore)).length;
}
export function areDifferent<T extends object>(left: T, right: T, propertiesToIgnore?: string[]) {
  if (Object.keys(left).length === 0) {
    return false;
  }
  return areDifferentForHistoryEntries(left, right, propertiesToIgnore);
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

export function logDiffForDirty<T extends object>(initial: T, current: T, enable = false) {
  if (!enable) {
    return;
  }
  const diff = differenceForAsObject(initial, current);
  console.log({ initial, current, diff }); // eslint-disable-line no-console
}
