import { cloneDeep, isEqual } from "lodash";

/**
 * this function will modify data!
 *
 * @param data an object
 */
export function stripNullOrUndefined<T>(data: T & { [index: string]: any }): T {
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

export function withoutNulldocUndefined<T>(data: T & { [p: string]: any }, propertiesToIgnore?: string[]): T {
  const clone = cloneDeep(data);
  propertiesToIgnore?.forEach((key) => {
    delete clone[key];
  });
  return stripNullOrUndefined(clone);
}

export function areDifferent(left: any, right: any, propertiesToIgnore?: string[]) {
  return !isEqual(withoutNulldocUndefined(left, propertiesToIgnore), withoutNulldocUndefined(right, propertiesToIgnore));
}
