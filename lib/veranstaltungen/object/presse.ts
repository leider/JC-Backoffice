import misc from "../../commons/misc";
import configure from "../../commons/simpleConfigure";

const prefix = configure.get("publicUrlPrefix");

export interface PresseRaw {
  originalText: string;
  text: string;
  image: string[];
  checked: boolean;
  jazzclubURL: string;
}

export interface PresseUI {
  originalText?: string;
  text?: string;
  existingbild?: string;
  checked?: boolean;
  jazzclubURL?: string;
}

export default class Presse implements PresseRaw {
  originalText: string;
  text: string;
  image: string[];
  checked: boolean;
  jazzclubURL: string;

  toJSON(): PresseRaw {
    return this;
  }

  constructor(object?: PresseRaw) {
    if (object) {
      this.originalText = object.originalText;
      this.text = object.text;
      this.image = misc.toArray(object.image);
      this.checked = object.checked;
      this.jazzclubURL = object.jazzclubURL;
    } else {
      this.originalText = "";
      this.text = "";
      this.image = [];
      this.checked = false;
      this.jazzclubURL = "";
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

  imageURL(): string {
    if (this.image.length > 0) {
      return "**Pressephoto:**\n" + this.imageURLpure();
    }
    return "";
  }

  imageURLpure(): string {
    if (this.image.length > 0) {
      return prefix + "/upload/" + encodeURIComponent(this.firstImage());
    }
    return "";
  }

  fullyQualifiedJazzclubURL(optionalURL?: string): string {
    return "http://www.jazzclub.de/event/" + (optionalURL || this.jazzclubURL);
  }
}
