import R from 'ramda';

import misc from '../commons/misc';
import User from './user';

class Users {
  filterReceivers(
    userscollection: User[],
    groupsFromBody: string[],
    userFromBody: string[]
  ): User[] {
    if (groupsFromBody && groupsFromBody.length > 0) {
      if (misc.toArray(groupsFromBody).includes('alle')) {
        return userscollection;
      }
      return R.uniq(
        R.flatten(
          misc
            .toArray(groupsFromBody)
            .concat('superusers')
            .map(group => {
              return userscollection.filter(user =>
                user.gruppen.includes(group)
              );
            })
        )
      );
    }
    return userscollection.filter(user => userFromBody.includes(user.id));
  }
}
export default new Users();
