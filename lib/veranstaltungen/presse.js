const configure = require('simple-configure');
const beans = configure.get('beans');
const misc = beans.get('misc');

const prefix = configure.get('publicUrlPrefix');

class Presse {
  constructor(object) {
    this.state = object || {};
    ['text', 'image', 'checked', 'jazzclubURL'].forEach(field => {
      this.state[field] = object[field];
    });
  }

  fillFromUI(object) {
    ['text', 'jazzclubURL'].forEach(field => {
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

  updateImage(image) {
    const imagePushed = misc.pushImage(this.state.image, image);
    if (imagePushed) {
      this.state.image = imagePushed;
      return true;
    }
    return false;
  }

  removeImage(image) {
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
      return '**Pressephoto:**\n' + prefix + '/upload/' + encodeURIComponent(this.firstImage());
    }
    return '';
  }

  checked() {
    return this.state.checked;
  }

  jazzclubURL() {
    return this.state.jazzclubURL || '';
  }

  fullyQualifiedJazzclubURL(optionalURL) {
    return 'http://www.jazzclub.de/event/' + (optionalURL || this.jazzclubURL());
  }

  text() {
    return this.state.text || '';
  }

}

module.exports = Presse;
