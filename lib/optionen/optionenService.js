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

  saveStuffFromVeranstaltung: function saveStuffFromVeranstaltung(stuff, callback) {
    store.get((err, optionen) => {
      if (err) { return callback(err); }
      if (stuff.agentur) { optionen.addOrUpdateKontakt('agenturen', stuff.agentur); }
      if (stuff.backlineJazzclub) { optionen.updateBackline('Jazzclub', stuff.backlineJazzclub); }
      if (stuff.backlineRockshop) { optionen.updateBackline('Rockshop', stuff.backlineRockshop); }
      if (stuff.techniker) { optionen.updateCollection('techniker', stuff.techniker); }
      if (stuff.merchandise) { optionen.updateCollection('merchandise', stuff.merchandise); }
      if (stuff.kasse) { optionen.updateCollection('kasse', stuff.kasse); }
      store.save(optionen, err1 => {
        callback(err1);
      });
    });
  }
};
