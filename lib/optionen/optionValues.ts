import R from 'ramda';
const sortByNameCaseInsensitive = R.sortBy(R.toLower);

const beans = require('simple-configure').get('beans');
import fieldHelpers from '../commons/fieldHelpers';
import misc from '../commons/misc';

export default class OptionValues {
  state: any;
  constructor(object: any) {
    this.state = object ? object : {};
    this.state.id = 'instance';

    [
      'plakatNum',
      'flyerNum',
      'plakatGroesse',
      'plakatVon',
      'hotelpreise',
      'genres'
    ].forEach(field => {
      this.state[field] = object[field] || [];
    });
    [
      'typen',
      'kooperationen',
      'backlineJazzclub',
      'backlineRockshop',
      'artists'
    ].forEach(field => {
      this.state[field] = sortByNameCaseInsensitive(object[field] || []);
    });
    this.state.agenturen = this.state.agenturen || [];
    this.state.hotels = this.state.hotels || [];
  }

  fillFromUI(object: any) {
    [
      'typen',
      'kooperationen',
      'backlineJazzclub',
      'backlineRockshop',
      'plakatNum',
      'flyerNum',
      'plakatGroesse',
      'plakatVon',
      'artists',
      'hotelpreise',
      'genres'
    ].forEach(field => {
      this.state[field] = misc.toArray(object[field]);
    });
    return this;
  }

  genres() {
    return this.state.genres;
  }

  preisprofile() {
    return [
      {
        name: 'Kooperation',
        regulaer: 0,
        rabattErmaessigt: 0,
        rabattMitglied: 0
      },
      {
        name: 'Freier Eintritt',
        regulaer: 0,
        rabattErmaessigt: 0,
        rabattMitglied: 0
      },
      { name: 'Classix', regulaer: 5, rabattErmaessigt: 1, rabattMitglied: 5 },
      { name: '6,00', regulaer: 6, rabattErmaessigt: 1, rabattMitglied: 2 },
      { name: '8,00', regulaer: 8, rabattErmaessigt: 2, rabattMitglied: 4 },
      { name: '10,00', regulaer: 10, rabattErmaessigt: 2, rabattMitglied: 5 },
      { name: '12,00', regulaer: 12, rabattErmaessigt: 2, rabattMitglied: 5 },
      { name: '15,00', regulaer: 15, rabattErmaessigt: 2, rabattMitglied: 5 },
      { name: '18,00', regulaer: 18, rabattErmaessigt: 2, rabattMitglied: 5 },
      { name: '22,00', regulaer: 22, rabattErmaessigt: 2, rabattMitglied: 5 },
      { name: '26,00', regulaer: 26, rabattErmaessigt: 2, rabattMitglied: 5 },
      { name: '30,00', regulaer: 30, rabattErmaessigt: 3, rabattMitglied: 7 },
      { name: '34,00', regulaer: 34, rabattErmaessigt: 3, rabattMitglied: 7 },
      { name: '38,00', regulaer: 38, rabattErmaessigt: 3, rabattMitglied: 7 },
      { name: '42,00', regulaer: 42, rabattErmaessigt: 3, rabattMitglied: 7 }
    ];
  }

  noOfEmails() {
    return R.range(1, 16);
  }

  artists() {
    return this.state.artists;
  }

  typen() {
    return this.state.typen;
  }

  kooperationen() {
    return this.state.kooperationen;
  }

  kontakte(kontaktKey: any) {
    return [{ name: '[temporär]' }, { name: '[neu]' }].concat(
      this.state[kontaktKey]
    );
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

  addOrUpdateKontakt(kontaktKey: any, kontakt: any) {
    if (kontakt.auswahl.match(/\[temporär\]/)) {
      delete kontakt.auswahl;
      return;
    }
    if (kontakt.auswahl.match(/\[neu\]/)) {
      delete kontakt.auswahl;
      this.state[kontaktKey].push(kontakt);
      return;
    }
    delete kontakt.auswahl;
    const existingKontakt = this.state[kontaktKey].find(
      (k: any) => k.name === kontakt.name
    );
    existingKontakt.ansprechpartner = kontakt.ansprechpartner;
    existingKontakt.telefon = kontakt.telefon;
    existingKontakt.email = kontakt.email;
    existingKontakt.adresse = kontakt.adresse;
  }

  updateHotelpreise(hotel: any, unterkunft: any) {
    if (!this.hotels().find(h => h.name === hotel.name)) {
      // kein Hotel gefunden
      return;
    }
    const existingPreise = this.state.hotelpreise.find(
      (p: any) => p.name === hotel.name
    );
    if (existingPreise) {
      existingPreise.einzelEUR = fieldHelpers.parseNumberWithCurrentLocale(
        unterkunft.einzelEUR
      );
      existingPreise.doppelEUR = fieldHelpers.parseNumberWithCurrentLocale(
        unterkunft.doppelEUR
      );
      existingPreise.suiteEUR = fieldHelpers.parseNumberWithCurrentLocale(
        unterkunft.suiteEUR
      );
    } else {
      this.state.hotelpreise.push({
        name: hotel.name,
        einzelEUR: fieldHelpers.parseNumberWithCurrentLocale(
          unterkunft.einzelEUR
        ),
        doppelEUR: fieldHelpers.parseNumberWithCurrentLocale(
          unterkunft.doppelEUR
        ),
        suiteEUR: fieldHelpers.parseNumberWithCurrentLocale(unterkunft.suiteEUR)
      });
    }
  }

  updateBackline(backlineKey: any, backline: any) {
    this.updateCollection('backline' + backlineKey, backline);
  }

  updateCollection(key: any, updatedCollection: any) {
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
}

