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

  saveAgentur: function saveAgentur(agentur, callback) {
    if (!agentur) { return callback(); }
    store.get((err, optionen) => {
      if (err) { return callback(err); }
      optionen.addOrUpdateKontakt('agenturen', agentur);
      store.save(optionen, err1 => {
        callback(err1);
      });
    });
  }
};
