const configure = require('simple-configure');

const prefix = configure.get('publicUrlPrefix');

class Presse {
  constructor(object) {
    this.state = object || {};
    ['text', 'image'].forEach(field => {
      this.state[field] = object[field];
    });
  }

  fillFromUI(object) {
    ['text', 'image'].forEach(field => {
      this.state[field] = object[field] || this.state[field]; // keep old values
    });
    return this;
  }

  image() {
    return this.state.image;
  }

  imageInlineURL() {
    return '![Pressephoto](' + prefix + '/upload/' + this.image() + ' "Pressephoto")  ';
  }

  imageURL() {
    if (this.image()) {
      return '**Pressephoto:\n**' + prefix + '/upload/' + this.image();
    }
    return '';
  }

  text() {
    return this.state.text;
  }

}

module.exports = Presse;
