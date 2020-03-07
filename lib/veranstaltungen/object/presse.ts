import misc from "../../commons/misc";

export interface PresseUI {
  originalText?: string;
  text?: string;
  existingbild?: string;
  checked?: boolean;
  jazzclubURL?: string;
}

export default class Presse {
  originalText = "";
  text = "";
  image: string[] = [];
  checked = false;
  jazzclubURL = "";

  toJSON(): any {
    return Object.assign({}, this);
  }

  constructor(object?: any) {
    if (object && Object.keys(object).length !== 0) {
      Object.assign(this, object, {
        image: misc.toArray(object.image)
      });
    }
  }

  fillFromUI(object: PresseUI): Presse {
    this.originalText = object.originalText || this.originalText;
    this.text = object.text || this.text;
    this.jazzclubURL = object.jazzclubURL || this.jazzclubURL;
    this.checked = !!object.checked;
    if (object.existingbild) {
      this.updateImage(object.existingbild);
    }
    return this;
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

  firstImage(): string {
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
      return prefix + "/upload/" + encodeURIComponent(this.firstImage());
    }
    return "";
  }

  fullyQualifiedJazzclubURL(optionalURL?: string): string {
    return "http://www.jazzclub.de/event/" + (optionalURL || this.jazzclubURL);
  }
}
