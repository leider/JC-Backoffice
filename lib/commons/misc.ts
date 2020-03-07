/* eslint-disable @typescript-eslint/no-explicit-any */
import R from "ramda";
import DatumUhrzeit from "./DatumUhrzeit";

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
      (jsobjects || []).map((each: object) => new Constructor(each))
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

  static compact<T>(array: T[]): T[] {
    return R.filter(a => !!a, array || []);
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
      return R.reject(each => each === image, images);
    }
  }
}
