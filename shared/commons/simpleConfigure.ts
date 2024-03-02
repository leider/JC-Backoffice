export class SimpleConfigure {
  storage: { [index: string]: string | number } = {};

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

  getString(property: string): string {
    return this.storage[property] as string;
  }

  reset(): void {
    this.storage = {};
  }
}
export default new SimpleConfigure();
