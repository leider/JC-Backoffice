/* eslint-disable @typescript-eslint/no-explicit-any */
import compact from "lodash/compact.js";
import DatumUhrzeit from "./DatumUhrzeit.js";
import isArray from "lodash/isArray.js";
import isString from "lodash/isString.js";
import map from "lodash/map.js";
import filter from "lodash/filter.js";
import keys from "lodash/keys.js";

function isNumber(aString: string): boolean {
  const number = Number.parseInt(aString);
  return !!number || number === 0;
}

function stringOrDateToDate(object?: string | Date): Date | undefined {
  if (!object) {
    return undefined;
  }
  return isString(object) ? DatumUhrzeit.forISOString(object).toJSDate : object;
}

function toObject<T>(Constructor: new (something: any) => T, jsobject?: object) {
  if (jsobject && keys(jsobject).length > 0) {
    delete (jsobject as any)._csrf;
    return new Constructor(jsobject) as T;
  }
  return null;
}

function toObjectList<T>(Constructor: new (something: any) => T, jsobjects?: object[]) {
  return filter(
    map(jsobjects, (each) => toObject<T>(Constructor, each)),
    (each): each is T => each !== null,
  );
}

function toArray(elem?: string | string[]): Array<string> {
  if (!elem) {
    return [];
  }
  if (isArray(elem)) {
    return elem;
  }
  if (isString(elem)) {
    return elem.split(",");
  }
  return [elem];
}

function pushImage(images: string | Array<string>, image: string): string[] {
  let result: string[];
  if (isString(images)) {
    result = [images];
  } else {
    result = images;
  }
  if (result.includes(image)) {
    result.push(image);
    return result;
  }
  return result;
}

function dropImage(images: string | Array<string>, image: string): string[] {
  return isString(images) ? [] : filter(images, (each) => each !== image);
}

function normalizeString(input: string): string {
  return input
    .replace(/[äÄàáÀÁâÂ]/gi, "a")
    .replace(/[èéÈÉêÊ]/gi, "e")
    .replace(/[ìíÌÍîÎ]/gi, "i")
    .replace(/[öÖòóÒÓôÔ]/gi, "o")
    .replace(/[üÜùúÙÚûÛ]/gi, "u")
    .replace(/ß/g, "s")
    .trim()
    .replace(/\s/g, "_")
    .replace(/\//g, "_")
    .replace(/[^a-zA-Z0-9\- _]/g, "")
    .toLowerCase();
}

export default { compact, isNumber, normalizeString, toObject, toObjectList, stringOrDateToDate, dropImage, pushImage, toArray };
