import R from 'ramda';

import misc from '../commons/misc';
import pers from '../persistence/persistence';
const persistence = pers('optionenstore');
import OptionValues from './optionValues';
import EmailAddresses from './emailAddresses';
import Orte from './orte';
import FerienIcals from './ferienIcals';

function toOptionValues(callback: Function, err: Error | null, jsobject: any) {
  return misc.toObject2(OptionValues, callback, err, jsobject);
}

function toEmailAddresses(
  callback: Function,
  err: Error | null,
  jsobject: any
) {
  return misc.toObject2(EmailAddresses, callback, err, jsobject);
}

function toOrte(callback: Function, err: Error | null, jsobject: any) {
  return misc.toObject(Orte, callback, err, jsobject);
}

function toIcals(callback: Function, err: Error | null, jsobject: any) {
  return misc.toObject2(FerienIcals, callback, err, jsobject);
}

export default {
  get: function get(callback: Function) {
    persistence.getById('instance', R.partial(toOptionValues, [callback]));
  },

  emailAddresses: function emailAddresses(callback: Function) {
    persistence.getById(
      'emailaddresses',
      R.partial(toEmailAddresses, [callback])
    );
  },

  orte: function orte(callback: Function) {
    persistence.getById('orte', R.partial(toOrte, [callback]));
  },

  icals: function icals(callback: Function) {
    persistence.getById('ferienIcals', R.partial(toIcals, [callback]));
  },

  save: function save(
    object: OptionValues | Orte | EmailAddresses | FerienIcals,
    callback: Function
  ) {
    persistence.save(object.toJSON(), callback);
  }
};
