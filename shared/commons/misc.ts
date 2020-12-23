/* eslint-disable @typescript-eslint/no-explicit-any */
import compact from "lodash/compact";
import DatumUhrzeit from "./DatumUhrzeit";

export interface Payload {
  url: string;
  params?: any;
}

export default class Misc {
  static isNumber(aString: string): boolean {
    const number = Number.parseInt(aString);
    return !!number || number === 0;
  }

  static stringOrDateToDate(object?: string | Date): Date | undefined {
    if (!object) {
      return undefined;
    }
    return typeof object === "string" ? DatumUhrzeit.forISOString(object).toJSDate : object;
  }

  static toObject(Constructor: any, callback: Function, err: Error | null, jsobject?: object): void {
    if (err) {
      return callback(err);
    }
    if (jsobject) {
      delete (jsobject as any)._csrf;
      delete (jsobject as any)._id;
      return callback(null, new Constructor(jsobject));
    }
    return callback(null, null);
  }

  static toObjectList(Constructor: any, callback: Function, err: Error | null, jsobjects?: object[]): void {
    if (err) {
      return callback(err);
    }
    return callback(
      null,
      (jsobjects || []).map((each: object) => {
        delete (each as any)._csrf;
        delete (each as any)._id;
        return new Constructor(each);
      })
    );
  }

  static toArray(elem?: string | string[]): Array<string> {
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

  static compact<T>(array?: T[]): T[] {
    return compact(array);
  }

  static pushImage(images: string | Array<string>, image: string): string[] {
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

  static dropImage(images: string | Array<string>, image: string): string[] {
    if (typeof images === "string") {
      return [];
    } else {
      return images.filter((each) => each !== image);
    }
  }

  static normalizeString(input: string): string {
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
}
