const R = require('ramda');

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
