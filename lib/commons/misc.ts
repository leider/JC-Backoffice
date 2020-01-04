/*eslint no-unused-vars: 0 */
import R from 'ramda';
import express from 'express';
import path from 'path';
import conf from './simpleConfigure';

export default class Misc {
  static isNumber(aString: string): boolean {
    const number = Number.parseInt(aString);
    return !!number || number === 0;
  }

  static toObject2(
    Constructor: any,
    callback: Function,
    err: Error | null,
    jsobject?: object
  ): void {
    if (err) {
      return callback(err);
    }
    if (jsobject) {
      return callback(null, Constructor.fromJSON(jsobject));
    }
    return callback(null, null);
  }

  static toObjectList2(
    Constructor: any,
    callback: Function,
    err: Error | null,
    jsobjects: object[]
  ): void {
    if (err) {
      return callback(err);
    }
    return callback(
      null,
      jsobjects.map(each => Constructor.fromJSON(each))
    );
  }

  static toObject(
    Constructor: any,
    callback: Function,
    err: Error | null,
    jsobject?: object
  ): void {
    if (err) {
      return callback(err);
    }
    if (jsobject) {
      return callback(null, new Constructor(jsobject));
    }
    return callback(null, null);
  }

  static toObjectList(
    Constructor: any,
    callback: Function,
    err: Error | null,
    jsobjects?: object[]
  ): void {
    if (err) {
      return callback(err);
    }
    return callback(
      null,
      (jsobjects || []).map((each: object) => new Constructor(each))
    );
  }

  static toArray(elem: any): Array<any> {
    if (!elem) {
      return [];
    }
    if (elem instanceof Array) {
      return elem;
    }
    if (typeof elem === 'string') {
      return elem.split(',');
    }
    return [elem];
  }

  static toFullQualifiedUrl(prefix: string, localUrl: string): string {
    function trimLeadingAndTrailingSlash(string: string): string {
      return string.replace(/(^\/)|(\/$)/g, '');
    }

    return (
      conf.get('publicUrlPrefix') +
      '/' +
      trimLeadingAndTrailingSlash(prefix) +
      '/' +
      trimLeadingAndTrailingSlash(localUrl)
    );
  }

  static expressAppIn(directory: string): express.Express {
    const app = express();
    app.set('views', path.join(directory, 'views'));
    app.set('view engine', 'pug');
    return app;
  }

  static compact<T>(array: T[]): T[] {
    return R.filter(a => !!a, array || []);
  }

  static pushImage(images: string | Array<string>, image: string): string[] {
    let result: string[];
    if (typeof images === 'string') {
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
    if (typeof images === 'string') {
      return [];
    } else {
      return R.reject(each => each === image, images);
    }
  }
}
