import misc from "../commons/misc";

export default class Presse {
  originalText = "";
  text = "";
  image: string[] = [];
  checked = false;
  jazzclubURL = "";

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  toJSON(): any {
    return Object.assign({}, this);
  }

  /* eslint-disable-next-line  @typescript-eslint/no-explicit-any*/
  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object, {
        image: misc.toArray(object.image),
      });
      if (!this.originalText) {
        this.originalText = "";
      }
    }
  }

  updateImage(image: string): boolean {
    const imagePushed = misc.pushImage(this.image, image);
    if (imagePushed.length > 0) {
      this.image = imagePushed;
      return true;
    }
    return false;
  }

  removeImage(image: string): void {
    this.image = misc.dropImage(this.image, image);
  }

  get firstImage(): string {
    return this.image[0];
  }

  imageURL(prefix: string): string {
    if (this.image.length > 0) {
      return "**Pressephoto:**\n" + this.imageURLpure(prefix);
    }
    return "";
  }

  imageURLpure(prefix: string): string {
    if (this.image.length > 0) {
      return prefix + "/upload/" + encodeURIComponent(this.firstImage);
    }
    return "";
  }

  get fullyQualifiedJazzclubURL(): string {
    return "https://www.jazzclub.de/event/" + this.jazzclubURL;
  }
}
