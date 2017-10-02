const R = require('ramda');

const configure = require('simple-configure');
const beans = configure.get('beans');
const misc = beans.get('misc');

const prefix = configure.get('publicUrlPrefix');

class Presse {
  constructor(object) {
    this.state = object || {};
    ['text', 'image', 'checked'].forEach(field => {
      this.state[field] = object[field];
    });
  }

  fillFromUI(object) {
    ['text'].forEach(field => {
      if (Array.isArray(object[field])) {
        this.state[field] = object[field][0];
      } else {
        this.state[field] = object[field] || this.state[field]; // keep old values
      }
    });
    ['checked'].forEach(field => {
      this.state[field] = !!object[field]; // handle undefined for checkbox
    });
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
    return this.state.image || [];
  }

  imageURL() {
    if (this.image() && this.image() !== 'undefined') {
      return '**Pressephoto:**\n' + prefix + '/upload/' + encodeURIComponent(this.image());
    }
    return '';
  }

  checked() {
    return this.state.checked;
  }

  text() {
    return this.state.text || '';
  }

}

module.exports = Presse;
