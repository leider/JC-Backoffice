class Staff {
  constructor(object) {
    this.state = object;
  }

  fillFromUI(object) {
    ['techniker', 'merchandise', 'kasse'].forEach(field => {
      this.state[field] = object[field];
    });

    return this;
  }

  techniker() {
    return this.state.techniker;
  }

  merchandise() {
    return this.state.merchandise;
  }

  kasse() {
    return this.state.kasse;
  }

}

module.exports = Staff;
