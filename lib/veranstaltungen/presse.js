const configure = require('simple-configure');

const prefix = configure.get('publicUrlPrefix');

class Presse {
  constructor(object) {
    this.state = object || {};
    ['text', 'image', 'checked'].forEach(field => {
      this.state[field] = object[field];
    });
  }

  fillFromUI(object) {
    ['text', 'image'].forEach(field => {
      if (Array.isArray(object[field])) {
        this.state[field] = object[field][0];
      } else {
        this.state[field] = object[field] || this.state[field]; // keep old values
      }
    });
    ['checked'].forEach(field => {
      if (Array.isArray(object[field])) {
        this.state[field] = object[field][0];
      } else {
        this.state[field] = object[field]; // handle undefined for checkbox
      }
    });
    return this;
  }

  image() {
    return this.state.image || '';
  }

  imageInlineURL() {
    return '![Pressephoto](' + prefix + '/upload/' + encodeURIComponent(this.image()) + ' "Pressephoto")  ';
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
