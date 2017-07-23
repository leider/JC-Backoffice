/*eslint no-process-exit: 0 */
/* eslint no-console: 0 */
'use strict';

require('./configure');
const beans = require('simple-configure').get('beans');
const optionenstore = beans.get('optionenstore');
const veranstaltungstore = beans.get('veranstaltungenstore');

veranstaltungstore.zukuenftige((err, result) => {
  if (err) {
    console.log(err);
    process.exit();
  }
  const artists = result.map(ver => ver.artist().name()).filter(name => !!name[0]);

  optionenstore.get((err1, optionen) => {
    if (err1) {
      console.log(err1);
      process.exit();
    }
    optionen.updateCollection('artists', artists);
    optionenstore.save(optionen, err2 => {
      if (err2) {
        console.log(err2);
      }
      console.log('Artists eingefügt ' + artists);
      process.exit();
    });
  });

});
