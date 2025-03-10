import { detailedDiff } from "deep-object-diff";
import isObject from "lodash/isObject.js";
import cloneDeep from "lodash/cloneDeep.js";
import forEach from "lodash/forEach.js";
import keys from "lodash/keys.js";

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
  if (Array.isArray(data)) {
    data.sort();
  }
  forEach(keys(data), (key) => {
    const dataCasted = data as T & SomeObject;
    if (dataCasted[key] === null || dataCasted[key] === undefined) {
      delete dataCasted[key];
    }
    if (isObject(dataCasted[key])) {
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
    forEach(nameArray, (part) => {
      target = target[part];
      if (!target) {
        return;
      }
    });
    if (target) {
      delete target[last];
    }
  }
  const clone = cloneDeep(data);
  forEach(propertiesToIgnore, (key) => {
    deleteProp(clone, key);
  });
  return stripNullOrUndefined(clone);
}

export function areDifferentForHistoryEntries<T extends object>(left?: T, right?: T, propertiesToIgnore?: string[]) {
  const { neu, alt } = differenceForAsObject(left, right, propertiesToIgnore);
  const neuNotEmpty = !!keys(neu).length;
  const altNotEmpty = !!keys(alt).length;
  return neuNotEmpty || altNotEmpty;
}
export function areDifferent<T extends object>(left?: T, right?: T, propertiesToIgnore?: string[]) {
  if (!left || !keys(left).length) {
    return false;
  }
  return areDifferentForHistoryEntries(left, right, propertiesToIgnore);
}

export function differenceForAsObject(left = {}, right = {}, propertiesToIgnore?: string[]): { neu: object; alt: object } {
  const a = withoutNullOrUndefinedStrippedBy(left, propertiesToIgnore);
  const b = withoutNullOrUndefinedStrippedBy(right, propertiesToIgnore);
  const diffAtoB = detailedDiff(a, b);
  const diffBtoA = detailedDiff(b, a);
  const mergedNeu = Object.assign(diffAtoB.updated ?? {}, diffAtoB.added ?? {});
  const mergedAlt = Object.assign(diffBtoA.updated ?? {}, diffAtoB.deleted ?? {});
  return { neu: mergedNeu, alt: mergedAlt };
}

export function logDiffForDirty<T extends object>(initial?: T, current?: T, enable = false) {
  if (!enable) {
    return;
  }
  const diff = differenceForAsObject(initial, current);
  console.log({ initial, current, diff }); // eslint-disable-line no-console
}
