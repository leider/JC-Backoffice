import store from "./optionenstore";
import Orte from "./orte";
import OptionValues, { Hotelpreise, Kontakt } from "./optionValues";

function kontaktForAuswahl(auswahl: string, kontaktTyp: "agenturen" | "hotels", callback: Function): void {
  store.get((err: Error | null, optionen: OptionValues) => {
    if (err) {
      return callback(err);
    }
    const ourCollection = kontaktTyp === "agenturen" ? optionen.agenturen : optionen.hotels;
    return callback(
      null,
      ourCollection.find((kontakt: Kontakt) => kontakt.name === auswahl)
    );
  });
}

function optionenUndOrte(callback: Function): void {
  store.get((err: Error | null, optionen: OptionValues) => {
    store.orte((err1: Error | null, orte: Orte) => {
      callback(err || err1, optionen, orte);
    });
  });
}

export default {
  optionen: function optionen(callback: Function): void {
    store.get(callback);
  },

  optionenUndOrte: optionenUndOrte,

  emailAddresses: function emailAddresses(callback: Function): void {
    store.emailAddresses(callback);
  },

  orte: function orte(callback: Function): void {
    store.orte(callback);
  },

  icals: function icals(callback: Function): void {
    store.icals(callback);
  },

  agenturForAuswahl: function agenturForAuswahl(auswahl: string, callback: Function): void {
    kontaktForAuswahl(auswahl, "agenturen", callback);
  },

  hotelForAuswahl: function hotelForAuswahl(auswahl: string, callback: Function): void {
    kontaktForAuswahl(auswahl, "hotels", callback);
  },

  preiseForAuswahl: function preiseForAuswahl(auswahl: string, callback: Function): void {
    store.get((err: Error | null, optionen: OptionValues) => {
      if (err) {
        return callback(err);
      }
      return callback(
        null,
        optionen.hotelpreise.find((preise: Hotelpreise) => preise.name === auswahl)
      );
    });
  },

  saveStuffFromVeranstaltung: function saveStuffFromVeranstaltung(body: any, callback: Function): void {
    const stuff = {
      agentur: body.agentur,
      hotel: body.hotel,
      backlineJazzclub: body.technik && body.technik.backlineJazzclub,
      backlineRockshop: body.technik && body.technik.backlineRockshop,
      artists: body.artist && body.artist.name,
      unterkunft: body.unterkunft,
      hotelpreise: body.hotelpreise,
      kopf: body.kopf
    };
    optionenUndOrte((err: Error | null, optionen: OptionValues, orte: Orte) => {
      if (err) {
        return callback(err);
      }
      if (stuff.agentur) {
        optionen.addOrUpdateKontakt("agenturen", stuff.agentur);
      }
      if (stuff.hotel) {
        optionen.addOrUpdateKontakt("hotels", stuff.hotel);
      }
      if (stuff.backlineJazzclub) {
        optionen.updateBackline("Jazzclub", stuff.backlineJazzclub);
      }
      if (stuff.backlineRockshop) {
        optionen.updateBackline("Rockshop", stuff.backlineRockshop);
      }
      if (stuff.artists) {
        optionen.updateCollection("artists", stuff.artists);
      }
      if (stuff.hotelpreise) {
        optionen.updateHotelpreise(stuff.hotel, stuff.unterkunft);
      }
      if (stuff.kopf) {
        orte.updateFlaeche(stuff.kopf);
      }
      return store.save(optionen, (err1: Error | null) => {
        store.save(orte, (err2: Error | null) => {
          callback(err1 || err2);
        });
      });
    });
  }
};
