/*eslint no-process-exit: 0 */
/* eslint no-console: 0 */
'use strict';

require('./configure');
const beans = require('simple-configure').get('beans');
const optionenstore = beans.get('optionenstore');

optionenstore.get((err1, optionen) => {
  if (err1) {
    console.log(err1);
    process.exit();
  }
  optionen.state.flaechen = optionen.state.flaechen.filter(flaeche => flaeche.ort !== null);
  optionenstore.save(optionen, err => {
    if (err) {
      console.log(err);
    }
    process.exit();
  });
});
