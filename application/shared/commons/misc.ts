/* eslint-disable @typescript-eslint/no-explicit-any */
import compact from "lodash/compact.js";
import DatumUhrzeit from "./DatumUhrzeit.js";

function isNumber(aString: string): boolean {
  const number = Number.parseInt(aString);
  return !!number || number === 0;
}

function stringOrDateToDate(object?: string | Date): Date | undefined {
  if (!object) {
    return undefined;
  }
  return typeof object === "string" ? DatumUhrzeit.forISOString(object).toJSDate : object;
}

function toObject<T>(Constructor: new (something: any) => T, jsobject?: object) {
  if (jsobject && Object.keys(jsobject).length > 0) {
    delete (jsobject as any)._csrf;
    return new Constructor(jsobject) as T;
  }
  return null;
}

function toObjectList<T>(Constructor: new (something: any) => T, jsobjects?: object[]) {
  return (jsobjects || []).map((each) => toObject<T>(Constructor, each)).filter((each): each is T => each !== null);
}

function toArray(elem?: string | string[]): Array<string> {
  if (!elem) {
    return [];
  }
  if (elem instanceof Array) {
    return elem;
  }
  if (typeof elem === "string") {
    return elem.split(",");
  }
  return [elem];
}

function pushImage(images: string | Array<string>, image: string): string[] {
  let result: string[];
  if (typeof images === "string") {
    result = [images];
  } else {
    result = images;
  }
  if (result.indexOf(image) === -1) {
    result.push(image);
    return result;
  }
  return result;
}

function dropImage(images: string | Array<string>, image: string): string[] {
  if (typeof images === "string") {
    return [];
  } else {
    return images.filter((each) => each !== image);
  }
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
