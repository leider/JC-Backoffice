/*eslint no-unused-vars: 0 */
const R = require('ramda');
const express = require('express');
const path = require('path');
const conf = require('simple-configure');
const mimetypes = require('mime-types');

const imageExtensions = R.flatten(
  R.keys(mimetypes.extensions)
    .filter(type => type.match(/^image/))
    .map(type => mimetypes.extensions[type])
);

function regexEscape(string) {
  return string.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

function asWholeWordEscaped(string) {
  return '^' + regexEscape(string) + '$';
}

function compact(array) {
  return R.filter(R.identity, array || []);
}

module.exports = {
  isNumber: function isNumber(aString) {
    const number = Number.parseInt(aString);
    return !!number || number === 0;
  },

  toObject: function toObject(Constructor, callback, err, jsobject) {
    if (err) {
      return callback(err);
    }
    if (jsobject) {
      return callback(null, new Constructor(jsobject));
    }
    callback(null, null);
  },

  toObjectList: function toObjectList(Constructor, callback, err, jsobjects) {
    if (err) {
      return callback(err);
    }
    callback(null, jsobjects.map(each => new Constructor(each)));
  },

  toArray: function toArray(elem) {
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
  },

  toFullQualifiedUrl: function toFullQualifiedUrl(prefix, localUrl) {
    function trimLeadingAndTrailingSlash(string) {
      return string.replace(/(^\/)|(\/$)/g, '');
    }

    return (
      conf.get('publicUrlPrefix') +
      '/' +
      trimLeadingAndTrailingSlash(prefix) +
      '/' +
      trimLeadingAndTrailingSlash(localUrl)
    );
  },

  expressAppIn: function expressAppIn(directory) {
    const app = express();
    app.set('views', path.join(directory, 'views'));
    app.set('view engine', 'pug');
    return app;
  },

  compact,

  pushImage: function pushImage(images, image) {
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
  },
  dropImage: function dropImage(images, image) {
    let result = images || [];
    if (!images) {
      result = [];
    }
    if (typeof images === 'string') {
      return [];
    }
    return R.reject(each => each === image, result);
  }
};
