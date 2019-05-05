/*eslint no-process-exit: 0 */
/* eslint no-console: 0 */

const async = require('async');

require('./configure');
const config = require('simple-configure');
const beans = config.get('beans');
const store = beans.get('userstore');

store.allUsers((err, result) => {
  if (err) {
    console.log(err);
    process.exit();
  }

  result.forEach(user => {
    user.gruppen = [];
    if (config.get('superusers').includes(user.id)) {
      user.gruppen.push('superusers');
    }
    if (config.get('bookingTeam').includes(user.id)) {
      user.gruppen.push('bookingTeam');
    }
  });

  async.each(result, (user, callback) => {
    user.gruppen = [];
    if (config.get('superusers').includes(user.id)) {
      user.gruppen.push('superusers');
    }
    if (config.get('bookingTeam').includes(user.id)) {
      user.gruppen.push('bookingTeam');
    }
    store.save(user, callback);
  }, err1 => {
    if (err1) {
      console.log(err1);
    }
    process.exit();
  });
});
