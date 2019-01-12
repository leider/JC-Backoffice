/*eslint no-process-exit: 0 */
/* eslint no-console: 0 */
'use strict';

const async = require('async');
require('./configure');
const beans = require('simple-configure').get('beans');
const store = beans.get('veranstaltungenstore');

store.alle((err1, veranstaltungen) => {
  if (err1) {
    console.log(err1);
    process.exit();
  }
  veranstaltungen.forEach(ver => {
    const kosten = ver.state.kosten;
    ver.state.technik = ver.state.technik || {};
    const technik = ver.state.technik;
    ['dateirider', 'technikJazzclub', 'technikAngebot1', 'backlineJazzclub', 'backlineRockshop', 'checked', 'fluegel'].forEach(field => {
      if (kosten[field]) {
        technik[field] = kosten[field];
      }
      delete kosten[field];
    });

  });
  async.each(veranstaltungen, store.saveVeranstaltung, err => {
    if (err) { console.log(err); }
    process.exit();
  });
});
