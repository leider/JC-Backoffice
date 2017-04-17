class Presse {
  constructor(object) {
    this.state = object || {};
    ['text', 'image'].forEach(field => {
      this.state[field] = object[field];
    });
  }

  fillFromUI(object) {
    ['text', 'image'].forEach(field => {
      this.state[field] = object[field];
    });
    return this;
  }

  image() {
    return this.state.image;
  }

  text() {
    return this.state.text;
  }

}

module.exports = Presse;
