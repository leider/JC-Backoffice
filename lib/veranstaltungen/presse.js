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

  imageURL() {
    return '![Pressephoto](' + prefix + '/upload/' + this.state.image + ' "Pressephoto")  ';
  }

  text() {
    return this.state.text;
  }

}

module.exports = Presse;
