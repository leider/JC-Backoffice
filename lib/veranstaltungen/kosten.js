class Kontakt {
  constructor(object) {
    this.state = object;
  }

  fillFromUI(object) {
    this.state.auswahl = object.auswahl;
    this.state.name = object.name;
    this.state.ansprechpartner = object.ansprechpartner;
    this.state.telefon = object.telefon;
    this.state.email = object.email;
    return this;
  }

  rider() {
    return this.state.rider;
  }

  backlineJazzclub() {
    return this.state.backlineJazzclub;
  }

  backlineRockshop() {
    return this.state.backlineRockshop;
  }

  backlineEUR() {
    return this.state.backlineEUR || 0;
  }

  saal() {
    return this.state.saal;
  }

  saalmiete() {
    return this.state.saalmiete || 0;
  }

  technikJazzclub() {
    return this.state.technikJazzclub;
  }

  technikAngebot1() {
    return this.state.technikAngebot1;
  }

  technikAngebot2() {
    return this.state.technikAngebot2;
  }

  technikAngebot1EUR() {
    return this.state.technikAngebot1EUR || 0;
  }

  technikAngebot2EUR() {
    return this.state.technikAngebot2EUR || 0;
  }

  ansprechpartner() {
    return this.state.ansprechpartner;
  }

}

module.exports = Kontakt;
