const R = require('ramda');

const conf = require('simple-configure');
const beans = conf.get('beans');
const misc = beans.get('misc');
class Users {

  constructor(userscollection) {
    this.userscollection = userscollection;
  }

  filterReceivers(groupsFromBody, userFromBody) {
    if (groupsFromBody && groupsFromBody.length > 0) {
      if (misc.toArray(groupsFromBody).includes('alle')) {
        return this.userscollection;
      }
      return R.uniq(R.flatten(misc.toArray(groupsFromBody).concat('superusers').map(group => {
        return this.userscollection.filter(user => user.gruppen.includes(group));
      })));
    }
    return this.userscollection.filter(user => userFromBody.includes(user.id));
  }
}

module.exports = Users;

