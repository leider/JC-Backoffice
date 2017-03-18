// const beans = require('simple-configure').get('beans');
// const fieldHelpers = beans.get('fieldHelpers');
// const misc = beans.get('misc');

class Vertrag {
  constructor(object) {
    this.state = object || {};
  }

  fillFromUI(object) {
    ['art', 'sprache'].forEach(field => {
      this.state[field] = object[field];
    });
    return this;
  }

  art() {
    return this.state.art;
  }

  arten() {
    return ['Jazzclub', 'Agentur/Künstler', 'JazzClassix'];
  }

  sprache() {
    return this.state.sprache || 'Deutsch';
  }
}

module.exports = Vertrag;
