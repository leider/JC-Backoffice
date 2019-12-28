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

  static toObject2(
    Constructor: any,
    callback: Function,
    err: Error | null,
    jsobject?: any
  ) {
    if (err) {
      return callback(err);
    }
    if (jsobject) {
      return callback(null, Constructor.fromJSON(jsobject));
    }
    callback(null, null);
  }

  static toObjectList2(
    Constructor: any,
    callback: Function,
    err: Error | null,
    jsobjects: Array<any>
  ) {
    if (err) {
      return callback(err);
    }
    callback(
      null,
      jsobjects.map(each => Constructor.fromJSON(each))
    );
  }

  static toObject(
    Constructor: any,
    callback: Function,
    err: Error | null,
    jsobject?: any
  ) {
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

  static pushImage(images: string | Array<string>, image: string) {
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
    return false;
  }

  static dropImage(images: string | Array<string>, image: string) {
    if (typeof images === 'string') {
      return [];
    } else {
      return R.reject(each => each === image, images);
    }
  }
}
