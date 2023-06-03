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

export function withoutNulldocUndefined<T>(data: T & { [index: string]: any }): T {
  const attributesToIgnore = ["agenturauswahl", "hotelauswahl"];
  const clone = stripNullOrUndefined(cloneDeep(data));
  console.log({ clone });
  attributesToIgnore.forEach((att) => {
    delete (clone as any)[att];
  });
  return clone;
}

export function areDifferent(left: any, right: any) {
  return !isEqual(withoutNulldocUndefined(left), withoutNulldocUndefined(right));
}
