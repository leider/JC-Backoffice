import path from "node:path";

export class SimpleConfigure {
  storage: { [index: string]: string | number } = {};
  baseDir = "";
  setBaseDirectory(baseDirectory: string) {
    this.baseDir = baseDirectory;
  }

  addProperties(properties: { [index: string]: string | number }): void {
    if (!properties) {
      return;
    }
    Object.keys(properties).forEach((property) => {
      this.storage[property] = properties[property];
    });
  }

  private get(property: string): string | number | object {
    return this.storage[property];
  }

  private getString(property: string): string {
    return this.get(property) as string;
  }

  // explicitly known
  get port() {
    return this.get("port") || "1969";
  }

  get publicUrlPrefix() {
    return this.getString("publicUrlPrefix");
  }

  get salt() {
    return this.getString("salt");
  }
  get refreshTTL() {
    return this.get("refreshTTL") as number;
  }
  get jwtTTL() {
    return this.get("jwtTTL") as number;
  }

  private createRealPath(thePath: string) {
    return path.isAbsolute(thePath) ? thePath : path.join(this.baseDir, thePath);
  }

  private inCorrectLocation(prop: string) {
    return this.createRealPath(this.getString(prop));
  }
  get sqlitedb() {
    return this.inCorrectLocation("sqlitedb");
  }
  get pdfuploadpath() {
    return this.inCorrectLocation("pdfuploadpath");
  }
  get wikipath() {
    return this.inCorrectLocation("wikipath");
  }

  get additionalstatic() {
    if (this.getString("additionalstatic")) {
      return this.inCorrectLocation("additionalstatic");
    }
    return this.createRealPath("./static");
  }
  get uploadDir() {
    return path.join(this.additionalstatic, "upload");
  }
  get filesDir() {
    return path.join(this.additionalstatic, "files");
  }

  // E-Mail
  get transportOptions() {
    return this.get("transport-options") as object;
  }
  get senderName() {
    return this.getString("sender-name");
  }
  get senderAddress() {
    return this.getString("sender-address");
  }
  get senderAddressDatev() {
    return this.getString("sender-address-datev");
  }

  get kassenzettelEmail() {
    return this.getString("kassenzettel-email");
  }
  get belegEmail() {
    return this.getString("beleg-email");
  }
  get barEmail() {
    return this.getString("bar-email");
  }
  get barName() {
    return this.getString("bar-name");
  }
  get fotografEmail() {
    return this.getString("fotograf-email");
  }
  get fotografName() {
    return this.getString("fotograf-name");
  }
  get stimmerEmail() {
    return this.getString("stimmer-email");
  }
  get stimmerName() {
    return this.getString("stimmer-name");
  }

  // dev options
  get doNotSendMails() {
    return this.getString("doNotSendMails") || "";
  }
  get nowForDevelopment() {
    return this.getString("nowForDevelopment");
  }
}
export default new SimpleConfigure();
