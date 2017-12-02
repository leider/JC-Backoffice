const beans = require('simple-configure').get('beans');
const store = beans.get('optionenstore');

function kontaktForAuswahl(auswahl, kontaktTyp, callback) {
  store.get((err, optionen) => {
    if (err) { return callback(err); }
    callback(null, optionen.state[kontaktTyp].find(kontakt => kontakt.name === auswahl));
  });
}

module.exports = {

  optionen: function optionen(callback) {
    store.get(callback);
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

  flaecheForOrt: function flaecheForOrt(ort, callback) {
    store.get((err, optionen) => {
      if (err) { return callback(err); }
      const gefunden = optionen.state.flaechen.find(flaeche => flaeche.ort === ort);
      callback(null, gefunden ? gefunden.flaeche : '0');
    });
  },

  saveStuffFromVeranstaltung: function saveStuffFromVeranstaltung(body, callback) {
    const stuff = {
      agentur: body.agentur,
      hotel: body.hotel,
      backlineJazzclub: body.kosten && body.kosten.backlineJazzclub,
      backlineRockshop: body.kosten && body.kosten.backlineRockshop,
      artists: body.artist && body.artist.name,
      unterkunft: body.unterkunft,
      hotelpreise: body.hotelpreise,
      kopf: body.kopf
    };
    store.get((err, optionen) => {
      if (err) { return callback(err); }
      if (stuff.agentur) { optionen.addOrUpdateKontakt('agenturen', stuff.agentur); }
      if (stuff.hotel) { optionen.addOrUpdateKontakt('hotels', stuff.hotel); }
      if (stuff.backlineJazzclub) { optionen.updateBackline('Jazzclub', stuff.backlineJazzclub); }
      if (stuff.backlineRockshop) { optionen.updateBackline('Rockshop', stuff.backlineRockshop); }
      if (stuff.artists) { optionen.updateCollection('artists', stuff.artists); }
      if (stuff.hotelpreise) { optionen.updateHotelpreise(stuff.hotel, stuff.unterkunft); }
      if (stuff.kopf) { optionen.updateFlaeche(stuff.kopf); }
      store.save(optionen, err1 => {
        callback(err1);
      });
    });
  }
};
