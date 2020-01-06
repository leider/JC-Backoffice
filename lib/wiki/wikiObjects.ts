import DatumUhrzeit from "../commons/DatumUhrzeit";
import path from "path";

export class Metadata {
  name: string;
  hashRef: string;
  fullhash: string;
  author: string;
  datestring: string;
  comment: string;

  constructor(object: string[]) {
    this.hashRef = object[0];
    this.fullhash = object[1];
    this.author = object[2];
    this.datestring = object[3];
    this.comment = object[4];
    this.name = object[5];
  }

  get date(): DatumUhrzeit {
    return DatumUhrzeit.forJSDate(new Date(this.datestring));
  }

  get url(): string {
    return `/wiki/${path.dirname(this.name)}/${path.basename(this.name, ".md")}`;
  }
}
