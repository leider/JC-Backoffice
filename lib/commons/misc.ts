/*eslint no-unused-vars: 0 */
import R from 'ramda';
import express from 'express';
import path from 'path';
const conf = require('simple-configure');

export default class Misc {
  static isNumber(aString: string) {
    const number = Number.parseInt(aString);
    return !!number || number === 0;
  }

  static toObject(Constructor: any, callback: Function, err: Error | null, jsobject?: any) {
    if (err) {
      return callback(err);
    }
    if (jsobject) {
      return callback(null, new Constructor(jsobject));
    }
    callback(null, null);
  }

  static toObjectList(
    Constructor: any,
    callback: Function,
    err: Error | null,
    jsobjects?: any
  ) {
    if (err) {
      return callback(err);
    }
    callback(
      null,
      jsobjects.map((each: any) => new Constructor(each))
    );
  }

  static toArray(elem: any) {
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

  static toFullQualifiedUrl(prefix: string, localUrl: string) {
    function trimLeadingAndTrailingSlash(string: string) {
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

  static expressAppIn(directory: string) {
    const app = express();
    app.set('views', path.join(directory, 'views'));
    app.set('view engine', 'pug');
    return app;
  }

  static compact(array: Array<any>) {
    return R.filter(R.identity, array || []);
  }

  static pushImage(images: any, image: string) {
    let result = images;
    if (!images) {
      result = [];
    }
    if (typeof images === 'string') {
      result = [images];
    }
    if (result.indexOf(image) === -1) {
      result.push(image);
      return result;
    }
    return false;
  }

  static dropImage(images: any, image: string) {
    let result: string[] = images || [];
    if (!images) {
      result = [];
    }
    if (typeof images === 'string') {
      return [];
    }
    return R.reject((each: string) => each === image, result);
  }
}
