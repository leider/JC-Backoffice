/* eslint-disable no-unused-expressions*/
import { expect } from "chai";

import Staff from "../../lib/veranstaltungen/object/staff";

describe("Staff", () => {
  describe("kann sagen, ob jemand für die Kasse fehlt", () => {
    let staff: Staff;
    beforeEach(() => {
      staff = new Staff({
        techniker: [],
        technikerV: [],
        merchandise: [],
        kasse: [],
        kasseV: [],
        mod: [],
        technikerNotNeeded: false,
        technikerVNotNeeded: false,
        kasseNotNeeded: false,
        kasseVNotNeeded: false,
        modNotNeeded: false,
        merchandiseNotNeeded: false
      });
    });
    it("initial", () => {
      expect(staff.kasseFehlt()).to.be.true;
    });

    it("wenn nur einer gebraucht wird", () => {
      staff.state.kasseVNotNeeded = true;
      expect(staff.kasseFehlt()).to.be.true;

      staff.state.kasseNotNeeded = true;
      staff.state.kasseVNotNeeded = false;
      expect(staff.kasseFehlt()).to.be.true;
    });

    it("wenn nur einer fehlt", () => {
      staff.state.kasse.push("Peter");
      expect(staff.kasseFehlt()).to.be.true;
    });

    it("wenn beide da sind", () => {
      staff.state.kasse.push("Peter");
      staff.state.kasseV.push("Peter");
      expect(staff.kasseFehlt()).to.be.false;
    });

    it("normal gebraucht, einer da", () => {
      staff.state.kasse.push("Peter");
      staff.state.kasseVNotNeeded = true;
      expect(staff.kasseFehlt()).to.be.false;
    });

    it("verantwortlich gebraucht, einer da", () => {
      staff.state.kasseV.push("Peter");
      staff.state.kasseNotNeeded = true;
      expect(staff.kasseFehlt()).to.be.false;
    });
  });
});
