class Kontakt {
  constructor(object) {
    this.state = object;
  }

  fillFromUI(object) {
    this.state.auswahl = object.auswahl;
    this.state.name = object.name;
    this.state.telefon = object.telefon;
    this.state.email = object.email;
    return this;
  }

  auswahl() {
    return this.state.auswahl;
  }

  name() {
    return this.state.name;
  }

  telefon() {
    return this.state.telefon;
  }

  email() {
    return this.state.email;
  }

}

module.exports = Kontakt;
