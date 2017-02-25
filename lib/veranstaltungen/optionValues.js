class OptionValues {
  constructor(object) {
    this.state = object ? object : {};
  }

  typen() {
    return this.state.typen || [];
  }

  orte() {
    return this.state.orte || [];
  }

  kooperationen() {
    return this.state.kooperationen || [];
  }

  kontakte() {
    return this.state.kontakte || [];
  }

  verantwortliche() {
    return this.state.verantwortliche || [];
  }
}

module.exports = OptionValues;
