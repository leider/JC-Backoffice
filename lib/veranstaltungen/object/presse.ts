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

export default class Presse {
  state: PresseRaw;

  toJSON(): PresseRaw {
    return this.state;
  }

  constructor(object: PresseRaw | undefined) {
    this.state = object || {
      originalText: "",
      text: "",
      image: [],
      checked: false,
      jazzclubURL: ""
    };
  }

  fillFromUI(object: PresseUI): Presse {
    this.state.originalText = object.originalText || this.state.originalText;
    this.state.text = object.text || this.state.text;
    this.state.jazzclubURL = object.jazzclubURL || this.state.jazzclubURL;
    this.state.checked = !!object.checked;
    if (object.existingbild) {
      this.updateImage(object.existingbild);
    }
    return this;
  }

  updateImage(image: string): boolean {
    const imagePushed = misc.pushImage(this.state.image, image);
    if (imagePushed.length > 0) {
      this.state.image = imagePushed;
      return true;
    }
    return false;
  }

  removeImage(image: string): void {
    this.state.image = misc.dropImage(this.state.image, image);
  }

  image(): string[] {
    return misc.toArray(this.state.image) || [];
  }

  firstImage(): string {
    return this.image()[0];
  }

  imageURL(): string {
    if (this.image().length > 0) {
      return "**Pressephoto:**\n" + this.imageURLpure();
    }
    return "";
  }

  imageURLpure(): string {
    if (this.image().length > 0) {
      return prefix + "/upload/" + encodeURIComponent(this.firstImage());
    }
    return "";
  }

  checked(): boolean {
    return this.state.checked;
  }

  jazzclubURL(): string {
    return this.state.jazzclubURL;
  }

  fullyQualifiedJazzclubURL(optionalURL?: string): string {
    return "http://www.jazzclub.de/event/" + (optionalURL || this.jazzclubURL());
  }

  text(): string {
    return this.state.text;
  }

  originalText(): string {
    return this.state.originalText;
  }
}
