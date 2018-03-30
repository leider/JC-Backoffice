'use strict';

const expect = require('must-dist');

const beans = require('../../configure').get('beans');
const Staff = beans.get('staff');

describe('Staff', () => {

  describe('kann sagen, ob jemand für die Kasse fehlt', () => {
    it('initial', () => {
      const staff = new Staff({});
      expect(staff.kasseFehlt()).to.be(true);
    });

    it('wenn nur einer gebraucht wird', () => {
      const staff = new Staff({});
      staff.state.kasseVNotNeeded = true;
      expect(staff.kasseFehlt()).to.be(true);

      staff.state.kasseNotNeeded = true;
      staff.state.kasseVNotNeeded = false;
      expect(staff.kasseFehlt()).to.be(true);
    });

    it('wenn nur einer fehlt', () => {
      const staff = new Staff({});
      staff.state.kasse.push('Peter');
      expect(staff.kasseFehlt()).to.be(true);
    });

    it('wenn beide da sind', () => {
      const staff = new Staff({});
      staff.state.kasse.push('Peter');
      staff.state.kasseV.push('Peter');
      expect(staff.kasseFehlt()).to.be(false);
    });

    it('normal gebraucht, einer da', () => {
      const staff = new Staff({});
      staff.state.kasse.push('Peter');
      staff.state.kasseVNotNeeded = true;
      expect(staff.kasseFehlt()).to.be(false);
    });

    it('verantwortlich gebraucht, einer da', () => {
      const staff = new Staff({});
      staff.state.kasseV.push('Peter');
      staff.state.kasseNotNeeded = true;
      expect(staff.kasseFehlt()).to.be(false);
    });
  });

});
