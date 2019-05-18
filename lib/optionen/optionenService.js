const beans = require('simple-configure').get('beans');
const store = beans.get('optionenstore');

function kontaktForAuswahl(auswahl, kontaktTyp, callback) {
  store.get((err, optionen) => {
    if (err) { return callback(err); }
    callback(null, optionen.state[kontaktTyp].find(kontakt => kontakt.name === auswahl));
  });
}

function optionenUndOrte(callback) {
  store.get((err, optionen) => {
    store.orte((err1, orte) => {
      callback(err || err1, optionen, orte);
    });
  });
}

module.exports = {

  optionen: function optionen(callback) {
    store.get(callback);
  },

  optionenUndOrte: optionenUndOrte,

  emailAddresses: function emailAddresses(callback) {
    store.emailAddresses(callback);
  },

  orte: function orte(callback) {
    store.orte(callback);
  },

  icals: function orte(callback) {
    store.icals(callback);
  },

  agenturForAuswahl: function agenturForAuswahl(auswahl, callback) {
    kontaktForAuswahl(auswahl, 'agenturen', callback);
  },

  hotelForAuswahl: function hotelForAuswahl(auswahl, callback) {
    kontaktForAuswahl(auswahl, 'hotels', callback);
  },

  preiseForAuswahl: function preiseForAuswahl(auswahl, callback) {
    store.get((err, optionen) => {
      if (err) { return callback(err); }
      callback(null, optionen.state.hotelpreise.find(preise => preise.name === auswahl));
    });
  },

  saveStuffFromVeranstaltung: function saveStuffFromVeranstaltung(body, callback) {
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
    optionenUndOrte((err, optionen, orte) => {
      if (err) { return callback(err); }
      if (stuff.agentur) { optionen.addOrUpdateKontakt('agenturen', stuff.agentur); }
      if (stuff.hotel) { optionen.addOrUpdateKontakt('hotels', stuff.hotel); }
      if (stuff.backlineJazzclub) { optionen.updateBackline('Jazzclub', stuff.backlineJazzclub); }
      if (stuff.backlineRockshop) { optionen.updateBackline('Rockshop', stuff.backlineRockshop); }
      if (stuff.artists) { optionen.updateCollection('artists', stuff.artists); }
      if (stuff.hotelpreise) { optionen.updateHotelpreise(stuff.hotel, stuff.unterkunft); }
      if (stuff.kopf) { orte.updateFlaeche(stuff.kopf); }
      store.save(optionen, err1 => {
        store.save(orte, err2 => {
          callback(err1 || err2);
        });
      });
    });
  }
};
