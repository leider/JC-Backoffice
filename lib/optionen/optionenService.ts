import store from './optionenstore';
import Orte from './orte';
import OptionValues from './optionValues';

function kontaktForAuswahl(
  auswahl: string,
  kontaktTyp: string,
  callback: Function
) {
  store.get((err: Error | null, optionen: OptionValues) => {
    if (err) {
      return callback(err);
    }
    callback(
      null,
      optionen.state[kontaktTyp].find(
        (kontakt: any) => kontakt.name === auswahl
      )
    );
  });
}

function optionenUndOrte(callback: Function) {
  store.get((err: Error | null, optionen: OptionValues) => {
    store.orte((err1: Error | null, orte: Orte) => {
      callback(err || err1, optionen, orte);
    });
  });
}

export default {
  optionen: function optionen(callback: Function) {
    store.get(callback);
  },

  optionenUndOrte: optionenUndOrte,

  emailAddresses: function emailAddresses(callback: Function) {
    store.emailAddresses(callback);
  },

  orte: function orte(callback: Function) {
    store.orte(callback);
  },

  icals: function icals(callback: Function) {
    store.icals(callback);
  },

  agenturForAuswahl: function agenturForAuswahl(
    auswahl: string,
    callback: Function
  ) {
    kontaktForAuswahl(auswahl, 'agenturen', callback);
  },

  hotelForAuswahl: function hotelForAuswahl(
    auswahl: string,
    callback: Function
  ) {
    kontaktForAuswahl(auswahl, 'hotels', callback);
  },

  preiseForAuswahl: function preiseForAuswahl(
    auswahl: string,
    callback: Function
  ) {
    store.get((err: Error | null, optionen: any) => {
      if (err) {
        return callback(err);
      }
      callback(
        null,
        optionen.state.hotelpreise.find(
          (preise: any) => preise.name === auswahl
        )
      );
    });
  },

  saveStuffFromVeranstaltung: function saveStuffFromVeranstaltung(
    body: any,
    callback: Function
  ) {
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
    optionenUndOrte((err: Error | null, optionen: any, orte: Orte) => {
      if (err) {
        return callback(err);
      }
      if (stuff.agentur) {
        optionen.addOrUpdateKontakt('agenturen', stuff.agentur);
      }
      if (stuff.hotel) {
        optionen.addOrUpdateKontakt('hotels', stuff.hotel);
      }
      if (stuff.backlineJazzclub) {
        optionen.updateBackline('Jazzclub', stuff.backlineJazzclub);
      }
      if (stuff.backlineRockshop) {
        optionen.updateBackline('Rockshop', stuff.backlineRockshop);
      }
      if (stuff.artists) {
        optionen.updateCollection('artists', stuff.artists);
      }
      if (stuff.hotelpreise) {
        optionen.updateHotelpreise(stuff.hotel, stuff.unterkunft);
      }
      if (stuff.kopf) {
        orte.updateFlaeche(stuff.kopf);
      }
      store.save(optionen, (err1: Error | null) => {
        store.save(orte, (err2: Error | null) => {
          callback(err1 || err2);
        });
      });
    });
  }
};
