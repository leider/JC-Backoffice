import misc from "../commons/misc.js";
import { RecursivePartial } from "../commons/advancedTypes.js";
import keys from "lodash/keys.js";

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

  constructor(object?: RecursivePartial<Presse>) {
    if (object && keys(object).length) {
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
