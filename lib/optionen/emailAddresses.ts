import R from 'ramda';

export default class EmailAddresses {
  state: any;

  constructor(object: any) {
    this.state = object ? object : {};
    this.state.id = 'emailaddresses';
  }

  fillFromUI(object: any) {
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
