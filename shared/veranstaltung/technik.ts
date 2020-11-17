import misc from "../commons/misc";

export default class Technik {
  dateirider: string[] = [];
  technikAngebot1?: string;
  backlineJazzclub: string[] = [];
  backlineRockshop: string[] = [];
  checked = false;
  fluegel = false;

  toJSON(): any {
    return Object.assign({}, this);
  }

  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object, {
        dateirider: object.dateirider || [],
      });
    }
  }

  updateDateirider(datei: string): boolean {
    const imagePushed = misc.pushImage(this.dateirider, datei);
    if (imagePushed) {
      this.dateirider = imagePushed;
      return true;
    }
    return false;
  }

  removeDateirider(datei: string): void {
    this.dateirider = misc.dropImage(this.dateirider, datei);
  }
}
