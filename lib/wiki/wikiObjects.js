const path = require('path');

const conf = require('simple-configure');
const beans = conf.get('beans');
const DatumUhrzeit = beans.get('DatumUhrzeit');

class Metadata {
  constructor(object) {
    this.name = object.name;
    this.hashRef = object.hashRef;
    this.fullhash = object.fullhash;
    this.author = object.author;
    this.datestring = object.date;
    this.comment = object.comment;
  }

  date() {
    return DatumUhrzeit.forJSDate(new Date(this.datestring));
  }

  url() {
    return `/wiki/${path.dirname(this.name)}/${path.basename(this.name, '.md')}`;
  }
}

module.exports.Metadata = Metadata;
