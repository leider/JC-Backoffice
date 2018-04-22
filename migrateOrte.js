/*eslint no-process-exit: 0 */
/* eslint no-console: 0 */
'use strict';

require('./configure');
const beans = require('simple-configure').get('beans');
const optionenstore = beans.get('optionenstore');
const Orte = beans.get('orte');

optionenstore.get((err1, optionen) => {
  if (err1) {
    console.log(err1);
    process.exit();
  }
  if (!optionen.state.flaechen) {
    console.log('nix zu migrieren');
    process.exit();
  }
  const orte = new Orte();
  optionen.state.flaechen.forEach(each => {
    orte.addOrt({name: each.ort, flaeche: each.flaeche, pressename: each.ort, presseIn: each.ort});
  });
  optionenstore.save(orte, err => {
    if (err) {
      console.log(err);
    }
    optionenstore.save(optionen, err2 => {
      if (err2) {
        console.log(err2);
      }
      process.exit();
    });
  });
});
