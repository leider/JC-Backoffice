const R = require('ramda');

const beans = require('simple-configure').get('beans');
const fieldHelpers = beans.get('fieldHelpers');
const misc = beans.get('misc');

class EmailAddresses {
  constructor(object) {
    this.state = object ? object : {};
    this.state.id = 'emailaddresses';
  }

  fillFromUI(object) {
    R.range(1, 16).forEach(no => {
      this.state['partner' + no] = object['partner' + no];
      this.state['email' + no] = object['email' + no];
    });
    return this;
  }

  noOfEmails() {
    return R.range(1, 16);
  }

}

module.exports = EmailAddresses;
