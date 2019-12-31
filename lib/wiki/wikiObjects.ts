import DatumUhrzeit from '../commons/DatumUhrzeit';
import path from 'path';

export class Metadata {
  name: string;
  hashRef: string;
  fullhash: string;
  author: string;
  datestring: string;
  comment: string;

  constructor(object: any) {
    this.name = object.name;
    this.hashRef = object.hashRef;
    this.fullhash = object.fullhash;
    this.author = object.author;
    this.datestring = object.date;
    this.comment = object.comment;
  }

  get date(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(new Date(this.datestring));
  }

  get url(): string {
    return `/wiki/${path.dirname(this.name)}/${path.basename(
      this.name,
      '.md'
    )}`;
  }
}
