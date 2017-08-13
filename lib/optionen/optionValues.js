const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const misc = beans.get('misc');

class OptionValues {
  constructor(object) {
    this.state = object ? object : {};
    this.state.id = 'instance';

    ['typen', 'orte', 'kooperationen', 'verantwortliche', 'techniker', 'merchandise', 'kasse',
      'fremdpersonal', 'backlineJazzclub', 'backlineRockshop', 'plakatNum', 'flyerNum',
      'plakatGroesse', 'plakatVon', 'artists', 'hotelpreise'].forEach(field => {
      this.state[field] = object[field] || [];
    });
    this.state.agenturen = this.state.agenturen || [];
    this.state.hotels = this.state.hotels || [];
    this.state.flaechen = this.state.flaechen || [];
  }

  fillFromUI(object) {
    ['typen', 'orte', 'kooperationen', 'verantwortliche', 'techniker', 'merchandise', 'kasse',
      'fremdpersonal', 'backlineJazzclub', 'backlineRockshop', 'plakatNum', 'flyerNum',
      'plakatGroesse', 'plakatVon', 'artists', 'hotelpreise'].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });
    ['technikerEUR', 'merchandiseEUR', 'kasseEUR'].forEach(field => {
      this.state[field] = fieldHelpers.parseNumberWithCurrentLocale(object[field]);
    });
    ['partner1', 'email1', 'partner2', 'email2', 'partner3', 'email3', 'partner4', 'email4',
      'partner5', 'email5', 'partner6', 'email6', 'partner7', 'email7', 'partner8', 'email8'].forEach(field => {
      this.state[field] = object[field];
    });
    return this;
  }

  artists() {
    return this.state.artists;
  }

  typen() {
    return this.state.typen;
  }

  orte() {
    return this.state.orte;
  }

  kooperationen() {
    return this.state.kooperationen;
  }

  kontakte(kontaktKey) {
    return [{name: '[temporär]'}, {name: '[neu]'}].concat(this.state[kontaktKey]);
  }

  agenturen() {
    return this.kontakte('agenturen');
  }

  hotels() {
    return this.kontakte('hotels');
  }

  backlineJazzclub() {
    return this.state.backlineJazzclub;
  }

  backlineRockshop() {
    return this.state.backlineRockshop;
  }

  addOrUpdateKontakt(kontaktKey, kontakt) {
    if (kontakt.auswahl.match(/\[temporär\]/)) {
      delete kontakt.auswahl;
      return;
    }
    if (kontakt.auswahl.match(/\[neu\]/)) {
      delete kontakt.auswahl;
      return this.state[kontaktKey].push(kontakt);
    }
    delete kontakt.auswahl;
    const existingKontakt = this.state[kontaktKey].find(k => k.name === kontakt.name);
    existingKontakt.ansprechpartner = kontakt.ansprechpartner;
    existingKontakt.telefon = kontakt.telefon;
    existingKontakt.email = kontakt.email;
    existingKontakt.adresse = kontakt.adresse;
  }

  updateHotelpreise(hotel, unterkunft) {
    const existingPreise = this.state.hotelpreise.find(p => p.name === hotel.name);
    if (existingPreise) {
      existingPreise.einzelEUR = fieldHelpers.parseNumberWithCurrentLocale(unterkunft.einzelEUR);
      existingPreise.doppelEUR = fieldHelpers.parseNumberWithCurrentLocale(unterkunft.doppelEUR);
      existingPreise.suiteEUR = fieldHelpers.parseNumberWithCurrentLocale(unterkunft.suiteEUR);
    } else {
      this.state.hotelpreise.push({
        name: hotel.name,
        einzelEUR: fieldHelpers.parseNumberWithCurrentLocale(unterkunft.einzelEUR),
        doppelEUR: fieldHelpers.parseNumberWithCurrentLocale(unterkunft.doppelEUR),
        suiteEUR: fieldHelpers.parseNumberWithCurrentLocale(unterkunft.suiteEUR)
      });
    }
  }

  updateFlaeche(kopf) {
    const existingOrt = this.state.flaechen.find(flaeche => flaeche.ort === kopf.ort);
    if (existingOrt) {
      existingOrt.flaeche = kopf.flaeche;
    } else {
      this.state.flaechen.push({
        ort: kopf.ort,
        flaeche: kopf.flaeche
      });
    }
  }

  updateBackline(backlineKey, backline) {
    this.updateCollection(('backline' + backlineKey), backline);
  }

  updateCollection(key, updatedCollection) {
    if (!this.state[key]) {
      this.state[key] = [];
    }
    const existingEntry = this.state[key];
    misc.toArray(updatedCollection).forEach(item => {
      if (existingEntry.indexOf(item) < 0) {
        existingEntry.push(item);
      }
    });
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

  fremdpersonal() {
    return this.state.fremdpersonal;
  }

  technikerEUR() {
    return this.state.technikerEUR || 100;
  }

  merchandiseEUR() {
    return this.state.merchandiseEUR || 20;
  }

  kasseEUR() {
    return this.state.kasseEUR || 20;
  }

  fremdpersonalEUR() {
    return 100;
  }

  layoutingEUR() {
    return this.state.layoutingEUR || 25;
  }

  plakatNum() {
    return this.state.plakatNum || [];
  }

  flyerNum() {
    return this.state.flyerNum || [];
  }

  plakatGroesse() {
    return this.state.plakatGroesse || [];
  }

  plakatVon() {
    return this.state.plakatVon || [];
  }

  verantwortliche() {
    return this.state.verantwortliche || [];
  }

  partner1() {
    return this.state.partner1;
  }

  email1() {
    return this.state.email1;
  }

  partner2() {
    return this.state.partner2;
  }

  email2() {
    return this.state.email2;
  }

  partner3() {
    return this.state.partner3;
  }

  email3() {
    return this.state.email3;
  }

  partner4() {
    return this.state.partner4;
  }

  email4() {
    return this.state.email4;
  }

  partner5() {
    return this.state.partner5;
  }

  email5() {
    return this.state.email5;
  }

  partner6() {
    return this.state.partner6;
  }

  email6() {
    return this.state.email6;
  }

  partner7() {
    return this.state.partner7;
  }

  email7() {
    return this.state.email7;
  }

  partner8() {
    return this.state.partner8;
  }

  email8() {
    return this.state.email8;
  }
}

module.exports = OptionValues;
