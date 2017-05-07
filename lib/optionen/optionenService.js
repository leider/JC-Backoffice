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

  saveStuffFromVeranstaltung: function saveStuffFromVeranstaltung(body, callback) {
    const stuff = {
      agentur: body.agentur,
      hotel: body.hotel,
      backlineJazzclub: body.kosten && body.kosten.backlineJazzclub,
      backlineRockshop: body.kosten && body.kosten.backlineRockshop,
      techniker: body.staff && body.staff.techniker,
      merchandise: body.staff && body.staff.merchandise,
      kasse: body.staff && body.staff.kasse,
      fremdpersonal: body.staff && body.staff.fremdpersonal,
      artists: body.artist && body.artist.name
    };
    store.get((err, optionen) => {
      if (err) { return callback(err); }
      if (stuff.agentur) { optionen.addOrUpdateKontakt('agenturen', stuff.agentur); }
      if (stuff.hotel) { optionen.addOrUpdateKontakt('hotels', stuff.hotel); }
      if (stuff.backlineJazzclub) { optionen.updateBackline('Jazzclub', stuff.backlineJazzclub); }
      if (stuff.backlineRockshop) { optionen.updateBackline('Rockshop', stuff.backlineRockshop); }
      if (stuff.techniker) { optionen.updateCollection('techniker', stuff.techniker); }
      if (stuff.merchandise) { optionen.updateCollection('merchandise', stuff.merchandise); }
      if (stuff.kasse) { optionen.updateCollection('kasse', stuff.kasse); }
      if (stuff.fremdpersonal) { optionen.updateCollection('fremdpersonal', stuff.fremdpersonal); }
      if (stuff.artists) { optionen.updateCollection('artists', stuff.artists); }
      store.save(optionen, err1 => {
        callback(err1);
      });
    });
  }
};
