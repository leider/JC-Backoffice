const beans = require('simple-configure').get('beans');
const store = beans.get('optionenstore');

module.exports = {

  optionen: function optionen(callback) {
    store.get(callback);
  },

  kontaktForAuswahl: function kontaktForAuswahl(auswahl, callback) {
    store.get((err, optionen) => {
      if (err) { return callback(err); }
      callback(null, optionen.state.kontakte.find(kontakt => kontakt.name === auswahl));
    });
  },

  saveKontakt: function saveKontakt(kontakt, callback) {
    store.get((err, optionen) => {
      if (err) { return callback(err); }
      optionen.addOrUpdateKontakt(kontakt);
      store.save(optionen, err1 => {
        callback(err1);
      });
    });
  }
};
