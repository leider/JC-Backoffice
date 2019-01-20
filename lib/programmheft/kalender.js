class Kalender {
  constructor(object) {
    this.state = object;
  }

  id() { // JahrMonat als String "YYYY/MM"
    return this.state.id;
  }

  text() {
    return this.state.text || 'Was | Wer | Farbe | Wann\n' +
      '--- | --- | ---   | ---\n';
  }

  setText(text) {
    this.state.text = text;
  }
}

module.exports = Kalender;
