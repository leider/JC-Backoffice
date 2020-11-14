import fs from "fs";
/* eslint-disable no-sync */
export class SimpleConfigure {
  storage: { [index: string]: string | number } = {};

  addFiles(files: string[]): void {
    if (!files) {
      return;
    }
    files.forEach((file) => {
      if (fs.existsSync(file)) {
        const theFile = fs.readFileSync(file, { encoding: "utf-8" });
        this.addProperties(JSON.parse(theFile));
      }
    });
  }

  addProperties(properties: { [index: string]: string | number }): void {
    if (!properties) {
      return;
    }
    Object.keys(properties).forEach((property) => {
      this.storage[property] = properties[property];
    });
  }

  get(property: string): string | number | object {
    return this.storage[property];
  }

  reset(): void {
    this.storage = {};
  }
}
export default new SimpleConfigure();
