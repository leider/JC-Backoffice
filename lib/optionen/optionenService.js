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
      if (stuff.agentur) {
        optionen.addOrUpdateKontakt('agenturen', stuff.agentur);
      }
      if (stuff.backlineJazzclub) {
        optionen.addOrUpdateBackline('Jazzclub', stuff.backlineJazzclub);
      }
      if (stuff.backlineRockshop) {
        optionen.addOrUpdateBackline('Rockshop', stuff.backlineRockshop);
      }
      store.save(optionen, err1 => {
        callback(err1);
      });
    });
  }
};
