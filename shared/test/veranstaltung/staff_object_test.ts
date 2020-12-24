/* eslint-disable no-unused-expressions*/
import { expect } from "chai";
import Staff from "../../veranstaltung/staff";

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
        merchandiseNotNeeded: false,
      });
    });
    it("initial", () => {
      expect(staff.kasseFehlt()).to.be.true;
    });

    it("wenn nur einer gebraucht wird", () => {
      staff.kasseVNotNeeded = true;
      expect(staff.kasseFehlt()).to.be.true;

      staff.kasseNotNeeded = true;
      staff.kasseVNotNeeded = false;
      expect(staff.kasseFehlt()).to.be.true;
    });

    it("wenn nur einer fehlt", () => {
      staff.kasse.push("Peter");
      expect(staff.kasseFehlt()).to.be.true;
    });

    it("wenn beide da sind", () => {
      staff.kasse.push("Peter");
      staff.kasseV.push("Peter");
      expect(staff.kasseFehlt()).to.be.false;
    });

    it("normal gebraucht, einer da", () => {
      staff.kasse.push("Peter");
      staff.kasseVNotNeeded = true;
      expect(staff.kasseFehlt()).to.be.false;
    });

    it("verantwortlich gebraucht, einer da", () => {
      staff.kasseV.push("Peter");
      staff.kasseNotNeeded = true;
      expect(staff.kasseFehlt()).to.be.false;
    });
  });
});
