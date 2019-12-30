import fs from 'fs';
/* eslint-disable no-sync */
class SimpleConfigure {
  storage: { [index: string]: any } = {};

  addFiles(files: string[]) {
    if (!files) {
      return;
    }
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const theFile = fs.readFileSync(file, { encoding: 'UTF-8' });
        this.addProperties(JSON.parse(theFile));
      }
    });
  }

  addProperties(properties: { [index: string]: any }) {
    if (!properties) {
      return;
    }
    Object.keys(properties).forEach(property => {
      this.storage[property] = properties[property];
    });
  }

  get(property: string) {
    return this.storage[property];
  }

  reset() {
    this.storage = {};
  }
}
export default new SimpleConfigure();
