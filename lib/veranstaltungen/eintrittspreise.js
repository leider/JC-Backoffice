class Eintrittspreise {
  constructor(object) {
    this.state = object;
  }

  fillFromUI(object) {
    this.state.regulaer = parseInt(object.regulaer, 10);
    this.state.rabattErmaessigt = parseInt(object.rabattErmaessigt, 10);
    this.state.rabattMitglied = parseInt(object.rabattMitglied, 10);
    this.state.frei = !!object.frei;
    return this;
  }

  standardRabattErmaessigt() {
    return 2;
  }

  standardRabattMitglied() {
    return 5;
  }

  frei() {
    return !!this.state.frei;
  }

  regulaer() {
    return this.state.regulaer || 0;
  }

  rabattErmaessigt() {
    return this.state.rabattErmaessigt || this.standardRabattErmaessigt();
  }

  rabattMitglied() {
    return this.state.rabattMitglied || this.standardRabattMitglied();
  }

  ermaessigt() {
    return this.regulaer() - Math.abs(this.rabattErmaessigt());
  }

  mitglied() {
    return this.regulaer() - Math.abs(this.rabattMitglied());
  }

}

module.exports = Eintrittspreise;
