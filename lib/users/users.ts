import R from 'ramda';

import misc from '../commons/misc';
import User from './user';

export default class Users {
  private userscollection: User[];
  constructor(userscollection: User[]) {
    this.userscollection = userscollection;
  }

  filterReceivers(groupsFromBody: string[], userFromBody: string[]) {
    if (groupsFromBody && groupsFromBody.length > 0) {
      if (misc.toArray(groupsFromBody).includes('alle')) {
        return this.userscollection;
      }
      return R.uniq(
        R.flatten(
          misc
            .toArray(groupsFromBody)
            .concat('superusers')
            .map(group => {
              return this.userscollection.filter(user =>
                user.gruppen.includes(group)
              );
            })
        )
      );
    }
    return this.userscollection.filter(user => userFromBody.includes(user.id));
  }
}
