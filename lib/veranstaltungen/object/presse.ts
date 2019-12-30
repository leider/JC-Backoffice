import misc from '../../commons/misc';
import configure from '../../commons/simpleConfigure';
const prefix = configure.get('publicUrlPrefix');

export default class Presse {
  state: any;
  constructor(object: any) {
    this.state = object || {};
    ['originalText', 'text', 'image', 'checked', 'jazzclubURL'].forEach(
      field => {
        this.state[field] = object[field];
      }
    );
  }

  fillFromUI(object: any) {
    ['originalText', 'text', 'jazzclubURL'].forEach(field => {
      if (Array.isArray(object[field])) {
        this.state[field] = object[field][0];
      } else {
        this.state[field] = object[field] || this.state[field]; // keep old values
      }
    });
    ['checked'].forEach(field => {
      this.state[field] = !!object[field]; // handle undefined for checkbox
    });
    if (object.existingbild) {
      this.updateImage(object.existingbild);
    }
    return this;
  }

  updateImage(image: string) {
    const imagePushed = misc.pushImage(this.state.image, image);
    if (imagePushed) {
      this.state.image = imagePushed;
      return true;
    }
    return false;
  }

  removeImage(image: string) {
    this.state.image = misc.dropImage(this.state.image, image);
  }

  image() {
    return misc.toArray(this.state.image) || [];
  }

  firstImage() {
    return this.image()[0];
  }

  imageURL() {
    if (this.image().length > 0) {
      return '**Pressephoto:**\n' + this.imageURLpure();
    }
    return '';
  }

  imageURLpure() {
    if (this.image().length > 0) {
      return prefix + '/upload/' + encodeURIComponent(this.firstImage());
    }
    return '';
  }

  checked() {
    return this.state.checked;
  }

  jazzclubURL() {
    return this.state.jazzclubURL || '';
  }

  fullyQualifiedJazzclubURL(optionalURL?: string) {
    return (
      'http://www.jazzclub.de/event/' + (optionalURL || this.jazzclubURL())
    );
  }

  text() {
    return this.state.text || '';
  }

  originalText() {
    return this.state.originalText || '';
  }
}
